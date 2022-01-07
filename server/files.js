// save files to a hash-based filestore
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

// TODO: generate thumbnails
class Filestore {
	where = path.join(process.cwd(), ".data"); 
	
	constructor(ctx, options) {
		this.log = ctx.log;
		this.db = ctx.db;
		this.options = options;
	}

	async insert(info, stream) {
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
				const [id] = await this.db("files").insert({ hash: h, name: info.filename, type: info.mimeType });
				this.log.debug(`saved file with hash ${h.toString("hex")}`);
				res(id);
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
	return new Filestore(ctx, options);
}

