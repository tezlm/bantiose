import express from "express";
const fmt = name => `bantiose::${name.replace(/\..$/, "")}`;
const serve = name => (_, res) => res.render(name, { title: fmt(name) });
const redir = path => (_, res) => res.redirect(path);

export default (app, { sessions: sess }) => {
	app.get("/", (_, res) => res.render("index.html", { title: "bantiose" }));
	app.get("/about", serve("about.html"));
	app.get("/login", match(redir("/"), serve("login.html")));
	app.get("/signup", match(redir("/"), serve("signup.html")));
	app.get("/create", match(serve("create.html"), redir("/login")));

	// static content
	app.use("/static", express.static("public"));

	function match(login, logout) {
		return (req, res) => {
			if(sess.from(req)) return login(req, res);
			return logout(req, res);
		}
	}
};

