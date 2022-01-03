export default (app, { log, db, sessions }) => {
	app.post("/create", create);
	app.get("/post/:id", getPost);

	async function create(req, res) {
		const userId = sessions.get(req.cookies.session);
		if(!userId) {
			log.debug(`...but was not logged in`);
			res.writeHead(400).end("not logged in");
			return;
		}

		const [id] = await db("posts").insert({
			createdAt: new Date(),
			title: req.body.title || "unnamed",
			description: req.body.body || "",
			author: userId,
		});

		log.info(`created post #${id}, by ${req.cookies.username}`);
		log.debug(`redirecting to info /post/${id}...`);
		res.redirect(`/post/${id}`);
	}

	async function getPost(req, res, next) {
		const [post] = await db("posts").select().where("postId", req.params.id);
		if(!post) return next();
		const [{ username }] = await db("users").select().where("userId", post.author);
		res.render("post.html", {
			title: post.title,
			time: new Date(post.createdAt).toLocaleString(),
			author: username,
			body: post.description,
		});
	}
};

