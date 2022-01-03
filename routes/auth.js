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

export default (app, { log, db, sessions }) => {
	app.post("/login", login, (_, res) => res.writeHead(400).end("bad username or password"));
	app.post("/signup", signup);

	async function signup(req, res) {
		const { username, password } = req.body;

		// make sure the passwords match!
		if(password !== req.body.firmpass) {
			log.debug(`...but passwords didnt match`);
			res.writeHead(400).end("passwords dont match");
			return;
		}

		// check if the username is taken
		const [user] = await db("users").select().where("username", username);
		if(user) {
			log.debug(`...but username was already taken`);
			res.writeHead(400).end("username already taken");
			return;
		}

		// create user
		const salt = genSalt();
		const hash = genHash(password + salt);
		const userId = await db("users").insert({ username, createdAt: new Date() });
		await db("passwords").insert({ userId, password: hash, salt });

		// celebrate with cookies!
		log.info(`new user! welcome, ${username}!`);
		res
			.cookie("session", sessions.add(userId))
			.cookie("username", username)
			.redirect("/");
	}

	async function login(req, res, next) {
		const { username, password } = req.body;

		// check if the user exists
		const [user] = await db("users").select("userId").where("username", username);
		if(!user) {
			log.debug(`...but username/password didn't exist`);
			return next();
		}

		// validate the password
		const [{ salt, password: hash }] = await db("passwords").select().where("userId", user.userId);
		if(!genHash(password + salt).equals(hash)) {
			log.debug(`...but username/password didn't exist`);
			return next();
		}

		// celebrate with cookies!
		log.debug(`logged in ${username}`);
		res
			.cookie("session", sessions.add(user.userId))
			.cookie("username", username)
			.redirect("/");
	}
};

