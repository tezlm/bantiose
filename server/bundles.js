import fs from "fs";
const defaultPath = `${process.cwd()}/public/words.txt`;

export class Bundle extends Map {
	constructor(file) {
		super();
		for(let line of file.split("\n")) {
			const [key, val] = line.split("=");
			this.set(key.trim(), val.trim());
		}
	}

	static read(path) {
		return new Bundle(fs.readFileSync(path, "utf8"));
	}
}

export default Bundle.read(defaultPath);

