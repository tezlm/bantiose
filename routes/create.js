import busboy from "busboy";

async function parse(req, files) {
	const bb = busboy({ headers: req.headers, limits: { files: 1 } });
	return new Promise((res) => {
		const post = {};
		let hasFile = false;
		bb.on("field", (key, val) => post[key] = val);
		bb.on("file", async (_name, stream, info) => {
			hasFile = true;
			res({ post, file: await files.insert(info, stream) });
		});
		bb.on("close", () => {
			if(!hasFile) res({ post });
		});
		req.pipe(bb);
	});
}

export default (app, { log, db, files, sessions }) => {
	app.post("/create", create);

	async function create(req, res) {
		const userId = sessions.get(req.cookies.session);
		if(!userId) return res.redirect("/login");
		const { post, file } = await parse(req, files);

		const [id] = await db("posts").insert({
			createdAt: new Date(),
			title: post.title || "unnamed",
			body: post.body || "",
			author: userId,
			attachment: file ?? null,
		});
		await db("log").insert({ createdAt: new Date(), type: "post.new", creator: userId, data: id });

		log.info(`created post #${id}, by ${req.cookies.username}`);
		log.debug(`redirecting to info /post/${id}...`);
		res.redirect(`/post/${id}`);
	}
};

