import express from "express";
import fs from "fs/promises";
import Log from "./server/log.js";

const port = process.env.PORT ?? 3000;
const app = express();
const log = new Log();

for(let i of await fs.readdir("routes")) {
	const { default: route }= await import(`./routes/${i}`);
	await route(app);
}

app.listen(port, () => log.info(`listening on :${port}`));

