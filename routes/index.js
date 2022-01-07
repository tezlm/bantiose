import { render } from "../server/posts.js";

export default (app, { db, sessions }) => {
	app.get("/", async (req, res) => {
		const recent = await db("posts").orderBy("postId", "desc").limit(30);
		const posts = await Promise.all(recent.map(getPost));
		res.render("index.html", {
			title: "bantiose",
			user: sessions.from(req) ? req.cookies.username : null,
			posts,
		})
	});

	async function getPost(post) {
		const [author] = await db("users").select().where("userId", post.author);
		return await render(db, post, author, true);
	}
};

