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
		setTimeout(() => this.delete(uuid), this.timeout);
		return uuid;
	}

	from(req) {
		return this.get(req.cookies.session);
	}

	reset(name) {
		for(let [key, value] of this) {
			if(name === value) this.delete(key);
		}
	}
}

// the default session manager
export default () => new Sessions();

