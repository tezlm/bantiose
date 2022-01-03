// a simple logger
const color = (text, color) => `\x1b[${color}m\x1b[1m${text}\x1b[0m`;
const tag = (name, c) => `[${color(name, c)}]`;
const c = console;

export default class Log {
	constructor(level = 3) {
		this.level = level;
	}

	debug(info) {
		if(this.level >= 4) c.debug(tag("D", "35"), info);
	}

	info(info) {
		if(this.level >= 3) c.log(tag("I", "36"), info);
	}
	
	warn(info) {
		if(this.level >= 2) c.warn(tag("W", "33"), info);
	}

	error(info) {
		if(this.level >= 1) c.error(tag("E", "31"), info);
	}
}

