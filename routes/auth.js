import crypto from "crypto";
const hashOnce = (input) => crypto.createHash("sha256").update(input).digest();
const genSalt = () => crypto.randomBytes(16);

function genHash(input) {
	let hashed = input;
	for(let i = 0; i < 11235; i++) {
		hashed = hashOnce(input);
	}
	return hashed;
}

// TODO: username validation of some kind
export default (app, { log, db, sessions }) => {
	app.post("/login", login);
	app.post("/signup", signup);

	async function signup(req, res) {
		const { username, password } = req.body;

		// h usernames
		if(!/^[a-z0-9_-]{3,64}$/i.test(username)) return render(res, "signup", "bad username");

		// make sure the passwords match!
		if(password !== req.body.firmpass) return render(res, "signup", "passwords dont match");

		// check if the username is taken
		const [user] = await db("users").select().where("username", username);
		if(user) return render(res, "signup", "username already taken");

		// create user
		const salt = genSalt();
		const hash = genHash(password + salt);
		const userId = await db("users").insert({ username, createdAt: new Date() });
		await db("passwords").insert({ userId, password: hash, salt });
		await db("log").insert({ createdAt: new Date(), type: "user.new", creator: userId });

		// celebrate with cookies!
		log.info(`new user! welcome, ${username}!`);
		res
			.cookie("session", sessions.add(userId))
			.cookie("username", username)
			.redirect("/");
	}

	async function login(req, res) {
		const { username, password } = req.body;

		// check if the user exists
		const [user] = await db("users").select("userId").where("username", username);
		if(!user) return render(res, "login", "username or password incorrect");

		// validate the password
		const [{ salt, password: hash }] = await db("passwords").select().where("userId", user.userId);
		if(!genHash(password + salt).equals(hash)) return render(res, "login", "username or password incorrect");

		// celebrate with cookies!
		log.debug(`logged in ${username}`);
		res
			.cookie("session", sessions.add(user.userId))
			.cookie("username", username)
			.redirect("/");
	}

	function render(res, name, error) {
		res.render(`${name}.html`, { title: `bantiose::${name}`, error });
	}
};

