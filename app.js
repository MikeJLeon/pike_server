const express = require("express");
const app = express();
const config = process.env.PORT || require("./config.json");
const PORT = process.env.PORT || 3000;
const HOSTNAME = process.env.heroku || "Localhost";
const MongoClient = require("mongodb").MongoClient;
const uri = process.env.mConn || config["mConn"];
const winston = require("winston");
const test = [];
var cors = require("cors");
app.use(cors());
console.log(config);
const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  defaultMeta: { service: "user-service" },
  transports: [
    //
    // - Write to all logs with level `info` and below to `combined.log`
    // - Write all logs error (and below) to `error.log`.
    //
    new winston.transports.File({ filename: "error.json", level: "error" }),
    new winston.transports.File({ filename: "combined.json" })
  ]
});
app.get("/api/getLog", (req, res) => {
  logger.stream({ start: -1 }).on("log", function(log) {
    console.log(log.message);
  });
  res.send(true);
});
app.get("/api/getEvents", (req, res) => {
  const client = new MongoClient(uri, { useNewUrlParser: true });
  client.connect(err => {
    console.log(uri)
    console.log(err)
    const collection = client.db("events").collection("OFA");
    collection.find({}).toArray((error, result) => {
      if (error) {
        res.status(500).send(error);
        console.log(":/");
      }
      console.log(result);
      logger.log({
        level: "info",
        message: result.length
      });
      client.close();
      res.send(result);
    });
  });
});
function intervalFunc() {
  console.log("Hello!!!!");
  const spawn = require("child_process").spawn;
  const pythonProcess = spawn("python", ["python/OFAScraper.py"]);
  pythonProcess.stdout.on("data", function(data) {
    console.log(data.toString());
  });
  setInterval(intervalFunc, 3600000);
}

app.listen(PORT, () => {
  console.log(`Server running at ${HOSTNAME} on port ${PORT}.`);
  intervalFunc();
});
