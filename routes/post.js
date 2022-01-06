import { render, getUser, getPost } from "../server/posts.js";

export default (app, { log, db, sessions }) => {
	app.post("/create", create);
	app.get("/post/:id", routePost, cantFind);
	app.get("/raw/:id", routePostRaw, cantFind);

	async function create(req, res) {
		const userId = sessions.get(req.cookies.session);
		if(!userId) return res.redirect("/login");
		const post = req.body;

		const [id] = await db("posts").insert({
			createdAt: new Date(),
			title: post.title || "unnamed",
			body: post.body || "",
			author: userId,
		});

		log.info(`created post #${id}, by ${req.cookies.username}`);
		log.debug(`redirecting to info /post/${id}...`);
		res.redirect(`/post/${id}`);
	}

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

	async function cantFind(_, res) {
		res.render("404.html", { title: "bantiose::404" });
	}
};

