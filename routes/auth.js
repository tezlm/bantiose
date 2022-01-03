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
	// app.post("/login", login);
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

		sessions.add(username);
		log.info(`new user! welcome, ${username}!`);
		res.send("too hundrad okey");
	}
};

