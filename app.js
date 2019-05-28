const express = require("express");
const app = express();
const config = require("./config.json");
const PORT = 3000;
const HOSTNAME = "0.0.0.0";
const MongoClient = require("mongodb").MongoClient;
const uri = config["mConn"];
const winston = require("winston");
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
    test = log.message;
  });
  
});
app.get("/api/getEvents", (req, res) => {
  const client = new MongoClient(uri, { useNewUrlParser: true });
  client.connect(err => {
    const collection = client.db("events").collection("OFA");
    collection.find({}).toArray((error, result) => {
      if (error) {
        res.status(500).send(error);
        console.log(":/");
      }
      logger.log({
        level: "info",
        message: str((result.length(), null, 2))
      });
      client.close();
      res.send(result);
    });
  });
});

app.listen(PORT, HOSTNAME, () => {
  console.log(`Server running at ${HOSTNAME} on port ${PORT}.`);
});