const express = require("express");
const bodyParser = require("body-parser");
const dataStore = require("nedb");
const path = require("path");
const contactAPI = require(path.join(__dirname, "contactAPI"));

var port = process.env.PORT || 80;
const dbFileName2 = path.join(__dirname, "ec-stats.db");

const app = express();

app.use(bodyParser.json());

const db2 = new dataStore({
		filename: dbFileName2,
		autoload: true
});

contactAPI(app,db2);

app.listen(port, () => {
	console.log("Server ready");
});

console.log("Starting server...");