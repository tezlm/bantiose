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
	app.get("/config", config);
	app.post("/config/about", about);
	app.post("/config/password", password);
	app.post("/config/delete", deluser);
	
	async function config(req, res) {
		const sess = sessions.from(req);
		if(!sess) return res.redirect("/login");
		const sel = await db("users").select("about").where("userId", sess);
		res.render("config.html", { ...sel[0], title: "bantiose::config" });
	}

	async function about(req, res) {
		const sess = sessions.from(req);
		if(!sess) return res.redirect("/login");
		await db("users").update({ about: req.body.about }).where("userId", sess);
		log.debug(`update ${req.cookies.username}'s about`);
		res.redirect("/config");
	}

	async function password(req, res) {
		const sess = sessions.from(req); 
		if(!sess) {
			res.writeHead(401).end("not logged in");
			return;
		}

		const { password, newpass } = req.body;

    	// validate the password
    	const [{ salt, password: hash }] = await db("passwords").select().where("userId", sess);
    	if(!genHash(password + salt).equals(hash)) {
			return res.writeHead(401).end("bad password");
    	}

		// make sure the passwords match!
		if(newpass !== req.body.firmpass) {
			return res.writeHead(400).end("passwords dont match");
		}

		// update user
		const newsalt = genSalt();
		const newhash = genHash(newpass + newsalt);
		await db("passwords").update({ password: newhash, salt: newsalt }).where("userId", sess);

		// celebrate with cookies!
		log.debug(`update ${req.cookies.username}'s password`);
		res.cookies("sessions").redirect("/config");
	}

	async function deluser(req, res) {
		const sess = sessions.from(req); 
		if(!sess) {
			res.writeHead(401).end("not logged in");
			return;
		}

		const { password } = req.body;

    	// validate the password
    	const [{ salt, password: hash }] = await db("passwords").select().where("userId", sess);
    	if(!genHash(password + salt).equals(hash)) {
			return res.writeHead(401).end("bad password");
    	}

		// update user
		await db("users").delete().where("userId", sess);
		await db("passwords").delete().where("userId", sess);

		// cry in the corner (but with cookies...)
		log.info(`farewell, ${req.cookies.username}`);
		sessions.reset(sess);
		res.redirect("/config");
	}
};

