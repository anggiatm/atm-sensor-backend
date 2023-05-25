const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const axios = require("axios");
// const connect = require("connect"),
const http = require("http");
const port = 3003;

const app = express();
// .use(function (req, res, next) {
//   console.log(next());
//   next();
// })
// .use(function (req, res, next) {
//   console.log("end");
//   res.end("hello world");
// });

const table = "sensor";

const cors = require("cors");
const corsOptions = {
  origin: "*",
  credentials: false, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

// Jalankan server
app.listen(port);
// app.listen(port, () => {
//   console.log(`Server berjalan pada port ${port}`);
// });

// Konfigurasi database MySQL
const db = mysql.createConnection({
  host: "103.77.106.114",
  user: "root",
  password: "Motaz123!",
  database: "alarm",
});

// Hubungkan ke database MySQL
db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log("Terhubung ke database MySQL");
});

// MQTT CONFIG
const mqtt = require("mqtt");

const mqttHost = "103.77.106.114";
// const mqttHost = "192.168.137.1";
const mqttPort = "1883";
const clientId = "nodejs_webserver";

const mqttUrl = `mqtt://${mqttHost}:${mqttPort}`;
const mqttClient = mqtt.connect(mqttUrl, {
  clientId,
  clean: true,
  connectTimeout: 4000,
  username: "tes",
  password: "tes",
  reconnectPeriod: 1000,
});

const topic = "tes/tes";
const topic2 = "tes/tis";

mqttClient.on("connect", () => {
  console.log("Connected");
  // mqttClient.subscribe([topic, topic2], () => {
  //   console.log(`Subscribe to topic '${topic}'`);
  // });
});

// Menerima pesan MQTT
// mqttClient.on("message", (topic, message) => {
//   // console.log(`Menerima pesan pada topik: ${topic}`);
//   // console.log(`Isi pesan: ${message.toString()}`);

//   try {
//     const data = JSON.parse(message.toString());
//     try {
//       const sql = "UPDATE ${table} SET ? WHERE id = ?";
//       db.query(sql, [data, data.id], (error, result) => {
//         // console.log(error == true);
//         console.log(`Data dengan id ${data.id} berhasil diperbarui`);
//       });
//     } catch (err) {
//       console.error("Gagal menjalankan query database:", err);
//     }
//   } catch (error) {
//     console.error("Gagal mengurai pesan MQTT:", error);
//   }
// });

const checkDatabase = () => {
  const recipient = "6281315506090";
  const apikey = "8144895";
  // Kode untuk mengecek database
  db.query("SELECT * FROM ${table}", (err, results) => {
    if (err) {
      throw err;
    }
    // Mengeliminasi objek jika objek.key != 1
    const filteredResults = results.filter((obj) => obj.alarm_state === 1);
    let message = "DEVICE ALARM ! %0ADevice ID: %0A";
    const ids = filteredResults.map((row) => row.id);

    if (ids.length > 0) {
      message = message + ids.toString().replace(",", "%0A");
      message = message + "%0A%0APlease check device!";

      const url =
        "https://api.callmebot.com/whatsapp.php?phone=" +
        recipient +
        "&text=" +
        message +
        "&apikey=" +
        apikey;

      // try {
      //   axios
      //     .get(url, {
      //       headers: {
      //         Accept: "application/json",
      //         "Content-Type": "application/json;charset=UTF-8",
      //       },
      //     })
      //     .then((data, error) => {
      //       if (error) {
      //         throw error;
      //       }
      //       console.log(data);
      //     });
      // } catch (error) {
      //   console.error("Kirim Notifikasi Whatsapp Gagal", error);
      // }
    }
  });
};
// Menjalankan pengecekan setiap 5 menit
// const interval = 1 * 60 * 1000; // 5 menit dalam milidetik
const interval = 1 * 60 * 1000;
setInterval(checkDatabase, interval);
// Mendapatkan semua data
app.get("/esp", (req, res) => {
  const sql = `SELECT * FROM ${table}`;
  db.query(sql, (err, results) => {
    if (err) {
      throw err;
    }
    // console.log(results[1].last_update);
    res.json(results);
  });
});

// Mendapatkan data berdasarkan ID
app.get("/esp/:id", (req, res) => {
  const id = req.params.id;
  const sql = `SELECT * FROM ${table} WHERE id = ?`;
  db.query(sql, id, (err, result) => {
    if (err) {
      throw err;
    }
    res.json(result[0]);
  });
});

// Menambahkan data baru
app.post("/esp", (req, res) => {
  console.log(req.body);
  const {
    id,
    mac_addr,
    publish_to,
    alarm_state,
    buzzer_state,
    alarm_count,
    limit_switch,
    temp,
    hum,
    accel_x,
    accel_y,
    accel_z,
    accel_all,
  } = req.body;
  const sql = `INSERT INTO ${table} (id, mac_addr, publish_to, alarm_state, buzzer_state, alarm_count, limit_switch, temp, hum, accel_x, accel_y, accel_z, accel_all) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  db.query(
    sql,
    [
      id,
      mac_addr,
      publish_to,
      alarm_state,
      buzzer_state,
      alarm_count,
      limit_switch,
      temp,
      hum,
      accel_x,
      accel_y,
      accel_z,
      accel_all,
    ],
    (err, result) => {
      if (err) {
        throw err;
      }
      res.send("Data berhasil ditambahkan");
    }
  );
});

// Mengupdate data berdasarkan ID
app.put("/esp/:id", (req, res) => {
  const id = req.params.id;
  const {
    mac_addr,
    publish_to,
    alarm_state,
    buzzer_state,
    alarm_count,
    limit_switch,
    temp,
    hum,
    accel_x,
    accel_y,
    accel_z,
    accel_all,
  } = req.body;
  const sql = `UPDATE ${table} SET mac_addr = ?, publish_to = ?, alarm_state = ?, buzzer_state = ?, alarm_count = ?, limit_switch = ?, temp = ?, hum = ?, accel_x = ?, accel_y = ?, accel_z = ?, accel_all = ? WHERE id = ?`;
  db.query(
    sql,
    [
      mac_addr,
      publish_to,
      alarm_state,
      buzzer_state,
      alarm_count,
      limit_switch,
      temp,
      hum,
      accel_x,
      accel_y,
      accel_z,
      accel_all,
      id,
    ],
    (err, result) => {
      if (err) {
        throw err;
      }
      res.send("Data berhasil diupdate");
    }
  );
});

// Menghapus data berdasarkan ID
app.delete("/esp/:id", (req, res) => {
  const id = req.params.id;
  const sql = `DELETE FROM {table} WHERE id = ?`;
  db.query(sql, id, (err, result) => {
    if (err) {
      throw err;
    }
    res.send("Data berhasil dihapus");
  });
});

// Mengirimkan pesan publish ke MQTT
app.post("/esp/command", (req, res) => {
  console.log(req.body);
  const { id, buzzer, reboot } = req.body;
  console.log(JSON.stringify(req.body));

  mqttClient.publish("esp/command", JSON.stringify(req.body), (err) => {
    if (err) {
      throw err;
    }
    res.send({
      message: `Pesan dipublish ke `,
    });
  });
});
