// the core of bantiose
import express from "express";
import fs from "fs/promises";
import { engine } from 'express-handlebars';
import cookieParser from "cookie-parser";
import Log from "./server/log.js";

// setup stuff
const port = process.env.PORT ?? 3000;
const app = express();
const log = new Log(4);

// middleware
app.engine("html", engine({ extname: ".html" }));
app.set("views", "views");
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // api
app.use(cookieParser()); 
app.use((req, _, next) => {
	log.debug(`got a ${req.method} on ${req.url}`);
	next();
});

// load context
const ctx = {};
ctx.db = await load("./server/database.js", log);
ctx.sessions = await load("./server/sessions.js", log);
ctx.log = log;

// load routes
for(let i of await fs.readdir("routes")) {
	await load(`./routes/${i}`, app, ctx);
}

// 404
app.get("*", (_, res) => res.render("404.html", { title: "bantiose::404" }));

// ready!
app.listen(port, () => log.info(`listening on :${port}`));

// helper loading function
async function load(module, ...args) {
	const { default: loaded } = await import(module);
	return await loaded(...args);
}

