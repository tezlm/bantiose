import markdown from "markdown-it";
const md = markdown({
	xHtmlOut: true,
	langPrefix: "lang-",
	typographer: true,
	linkify: true,
});

export async function getPost(db, id) {
	const [post] = await db("posts").select().where("postId", id);
	return post ?? null;
}

export async function getUser(db, id) {
	const [user] = await db("users").select().where("userId", id);
	return user ?? null;
}

export function render(post, author, trim = false) {
	const date = new Date(post.createdAt);
	const body = (trim && post.body.length > 200) ? post.body.slice(0, 200) + "..." : post.body;
	return {
		id: post.postId,
		title: post.title,
		body: md.render(body),
		time: date,
		timefmt: format(date), 
		author: author?.username ?? "unknown...",
		attachment: attachment(post),
	};
}

// TODO: add support for other content types
export function attachment(post) {
	switch(post.attachType?.split("/")[0]) {
		case "image":
			return `<img src="/media/${post.attachHash.toString("hex")}/${escape(post.attachName)}" alt="main image" class="attachment" />`;
		default:
			return null;
	}
}

const units = [
	{ name: "second", size: 1000 },
	{ name: "minute", size: 60   },
	{ name: "hour",   size: 60   },
	{ name: "day",    size: 24   },
	{ name: "week",   size: 7    }, // dont get mad at me
	{ name: "month",  size: 4    }, // i will suffer and i deserve it
	{ name: "year",   size: 13   },
	{ name: "thousand years", size: 1000 },
	{ name: "million years",  size: 1000 },
	{ name: "eon",            size: 1000 },
	{ name: "era",            size: 1000 },
	{ name: "epoch",          size: 1000 },
	{ name: "universe",       size: 1000 }, // we ruined the last one dont do it again
	{ name: "internet explorer page load", size: 1000 },
];

function format(date) {
	const delta = Date.now() - date;
	let size = 1;
	for(let i = 0; i < units.length; i++) {
		const unit = units[i];
		size *= unit.size;
		if(delta < size * units[i + 1].size) {
			const relta = Math.floor(delta / size); // relative delta... stupid joke...
			const name = relta === 1 ? unit.name : unit.name + "s";
			return `${relta === 1 ? "a" : relta} ${name} ago`;
		}
	}
}

