export default (app) => {
	app.get("/", (_, res) => {
		res.send("lolok");
	});
};
