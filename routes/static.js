import express from "express";

export default (app) => {
	app.use("/static", express.static("public"));
};


