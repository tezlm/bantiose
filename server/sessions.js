import crypto from "crypto";

// generate sessions that automatically timeout
export class Sessions extends Map {
	constructor(timeout = 1000 * 60 * 60 * 24 * 7) {
		super();
		this.timeout = timeout;
	}
	
	add(name) {
		const uuid = crypto.randomUUID();
		this.set(uuid, name);
		setTimeout(() => this.delete(uuid));
		return uuid;
	}

	valid(name, uuid) {
		return this.has(uuid) && this.get(uuid) === name;
	}

	reset(name) {
		for(let [key, value] of this) {
			if(name === value) this.delete(key);
		}
	}
}

// the default session manager
export default () => new Sessions(1000 * 30);

