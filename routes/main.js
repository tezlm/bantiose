import { join } from "path";
const cwd = process.cwd();
const file = name => join(cwd, name);

export default (app) => {
	app.get("/", (_, res) => res.sendFile(file("views/index.html")));
};

