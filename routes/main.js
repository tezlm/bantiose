import express from "express";
const serve = name => (_, res) => res.render(name);

export default (app) => {
	app.get("/", serve("index.html"));
	for(let route of ["login", "signup", "about", "create"]) {
		app.get(`/${route}`, serve(`${route}.html`));
	}

	app.use("/static", express.static("public"));
};

