import express from "express";
// import { join } from "path";
// const cwd = process.cwd();
// const file = name => join(cwd, name);
// const serve = name => (_, res) => res.sendFile(file(name));

export default (app) => {
	app.use("/static", express.static("public"));
};


