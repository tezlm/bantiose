import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

class Filestore {
	where = path.join(process.cwd(), ".data"); 
	
	constructor(log, db, options) {
		this.log = log;
		this.db = db;
		this.options = options;
	}

	async insert(stream) {
		let hash = crypto.createHash("sha256");
		let size = 0;
		const tmpName = path.join(this.where, "tmp", crypto.randomUUID());
		const tmpFd = await fs.open(tmpName, "w");
		const tmp = tmpFd.createWriteStream(tmpName);
		return new Promise((res, rej) => {
			stream.on("data", (data) => {
				size += data.length;
				if(size >= this.options.maxSize) rej("file too big");
				hash.update(data);
				tmp.write(data);
			});
			stream.on("end", async () => {
				const h = hash.digest();
				await tmpFd.close();
				await fs.rename(tmpName, path.join(this.where, "files", h.toString("hex")));
				this.log.info("saved file with hash " + h.toString("hex"));
				res(h);
			});
		});
	}

	async get(hash) {
		const fd = await fs.open(path.join(this.where, "files", hash));
		return fd.createReadStream();
	}
}

async function exists(where) {
	return fs.access(where).then(() => true).catch(() => false);
}

export default async function(ctx, options) {
	if(!await exists(".data/files")) await fs.mkdir(".data/files");
	if(!await exists(".data/tmp")) await fs.mkdir(".data/tmp");
	return new Filestore(ctx.log, ctx.db, options);
}

