// the core of imgboard
import express from "express";
import fs from "fs/promises";
import Log from "./server/log.js";

// setup stuff
const port = process.env.PORT ?? 3000;
const app = express();
const log = new Log(4);

// logging middleware
app.use((req, _, next) => {
	log.debug(`got a ${req.method} on ${req.url}`);
	next();
});

// load routes
for(let i of await fs.readdir("routes")) {
	const { default: route } = await import(`./routes/${i}`);
	await route(app, log);
}

// ready!
app.listen(port, () => log.info(`listening on :${port}`));

