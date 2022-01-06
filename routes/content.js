import { render, getUser, getPost } from "../server/posts.js";

export default (app, { db, files }) => {
	app.get("/post/:id", routePost, cantFind);
	app.get("/raw/:id", routePostRaw, cantFind);
	app.get("/media/:hash", routeMedia, cantFind);
	app.get("/media/:hash/*", routeMedia, cantFind);

	async function routePost(req, res, next) {
		const post = await getPost(db, req.params.id);
		if(!post) return next();
		res.render("post.html", render(post, await getUser(db, post.author)));
	}

	async function routePostRaw(req, res, next) {
		const post = await getPost(db, req.params.id);
		if(!post) return next();
		res.contentType("text/markdown").send(post.body);
	}

	async function routeMedia(req, res, next) {
		const file = await files.get(req.params.hash).catch(() => null);
		if(!file) return next();
		file.pipe(res);
	}

	async function cantFind(_, res) {
		res.render("404.html", { title: "bantiose::404" });
	}
};

