import { join } from "path";
const cwd = process.cwd();
const file = name => join(cwd, name);
const serve = name => (_, res) => res.sendFile(file(name));

export default (app) => {
	app.get("/", serve("views/index.html"));
	app.get("/login", serve("views/login.html"));
	app.get("/signup", serve("views/signup.html"));
};

