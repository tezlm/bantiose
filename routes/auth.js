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
		if(password !== req.body.firmpass) {
			res.writeHead(400).end("username and password dont match");
			return;
		}
		const salt = genSalt();
		const hash = genHash(password + salt);
		const id = await db("users").insert({
			createdAt: new Date(),
			username,
		});
		await db("passwords").insert({
			userId: id,
			password: hash,
			salt: salt,
		});

		log.info(`new user! welcome, ${username}!`);
		res.cookie("session", sessions.add(username)).send("too hundrad okey");
	}

	async function login(req, res, next) {
		const { username, password } = req.body;
		const [user] = await db("users").select("userId").where("username", username);
		if(!user) return next();

		const [{ salt, password: hash }] = await db("passwords").select().where("userId", user.userId);
		if(!genHash(password + salt).equals(hash)) return next();

		sessions.add(username);
		log.debug(`logged in ${username}`);
		res.cookie("session", sessions.add(username)).send("too hundrad okey");
	}
};

