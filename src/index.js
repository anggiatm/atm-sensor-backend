const express = require("express");

const bodyParser = require("body-parser");
const app = express();
const port = 3003;

const db = require("./queries/queries");
const esp = require("./queries/esp-devices");
const wa = require("./whatsapp/whatsapp");

const cors = require("cors");
const corsOptions = {
  origin: "*",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

const mqtt = require("mqtt");

const host = "103.77.106.114";
// const host = "192.168.137.1";
const mqtt_port = "1883";
const clientId = "nodejs_webserver";

const connectUrl = `mqtt://${host}:${mqtt_port}`;
const client = mqtt.connect(connectUrl, {
  clientId,
  clean: true,
  connectTimeout: 4000,
  username: "tes",
  password: "tes",
  reconnectPeriod: 1000,
});

const topic = "tes/tes";
client.on("connect", () => {
  console.log("Connected");
  client.subscribe([topic], () => {
    console.log(`Subscribe to topic '${topic}'`);
  });
});

client.on("message", async (topic, payload) => {
  console.log(payload.toString());

  let id = JSON.parse(payload.toString()).id;
  let alarm_count = JSON.parse(payload.toString()).alarm_count;

  if (await wa.isAlarmIncrease(id, alarm_count)) {
    wa.sendWhatsappMessage("6281315506090", "Alarm ter-Trigger");
  }
  esp.updateFromEsp(JSON.parse(payload.toString()));
});

app.get("/", (request, response) => {
  response.json({ info: "Node.js, Express, and Postgres API" });
});

app.listen(port, () => {
  console.log(`App running on port ${port}.`);
});

app.get("/users", db.getUsers);
app.get("/users/:id", db.getUserById);
app.post("/users", db.createUser);
app.put("/users/:id", db.updateUser);
app.delete("/users/:id", db.deleteUser);

app.get("/esp", esp.get);
app.get("/esp/:id", esp.getById);
app.post("/esp", esp.create);
app.put("/esp/:id", esp.update);
app.delete("/esp/:id", esp.remove);
