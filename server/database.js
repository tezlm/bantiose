import knex from "knex";
import fs from "fs";

// create the default tables
async function init(schema, log) {
	if(await schema.hasTable("users")) return;
	log.info("creating new database");
	return schema.createTable("users", table => {
		// the main user table
		table.increments("userId").primary();
		table.date("createdAt");
		table.string("username");
		table.string("about");
		table.string("email");
		table.string("avatar");
	}).createTable("passwords", table => {
		// password hashes in a separate table just in case
		table.integer("userId").unsigned();
		table.binary("password");
		table.binary("salt");
	}).createTable("posts", table => {
		// table of all posts
		table.increments("postId").primary();
		table.date("createdAt");
		table.integer("author").unsigned();
		table.string("title");
		table.string("body");
	}).createTable("media", table => {
		// for the file store
		table.string("filename");
		table.string("hash");
		table.integer("filesize").unsigned();
	}).createTable("log", table => {
		// log of everything that happens
		table.increments("auditId");
		table.date("createdAt");
		table.string("type");
		table.string("creator");
		table.string("data");
	});
}

export default async (log) => {
	if(!fs.existsSync(".data")) fs.mkdirSync(".data");
	if(!fs.existsSync(".data/files")) fs.mkdirSync(".data/files");

	const db = knex({
		useNullAsDefault: true,
		client: "sqlite3",
		connection: { filename: "./.data/data.db" },
		log: {
			warn: log.warn.bind(log),
			error: log.error.bind(log),
			debug: log.debug.bind(log),
		},
	});

	await init(db.schema, log)
		.catch(err => log.error(err.toString()));

	return db;
};

