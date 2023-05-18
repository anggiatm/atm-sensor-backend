// const a = require("./database");
const dotenv = require("dotenv");
dotenv.config();
const Pool = require("pg").Pool;

const pool = new Pool({
  user: process.env.USER,
  host: process.env.HOST,
  database: process.env.DB,
  password: process.env.PASS,
  port: process.env.PORT,
});

const table = "esp_devices";
const columns = [
  "id",
  "mac_addr",
  "publish_to",
  "alarm_count",
  "warn_count",
  "temp",
  "hum",
  "accel_x",
  "accel_y",
  "accel_z",
  "accel_all",
];
const pk = columns[0];

const get = (request, response) => {
  pool.query(
    "SELECT * FROM " + table + " ORDER BY id ASC",
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    }
  );
};

const getById = (request, response) => {
  const id = parseInt(request.params.id);

  pool.query(
    "SELECT * FROM " + table + " WHERE " + pk + "= $1",
    [id],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    }
  );
};

const getByIdSingleParam = async (id) => {
  try {
    const res = await pool.query(
      "SELECT * FROM " + table + " WHERE " + pk + "= 'ABC123'"
    );
    return res.rows;
  } catch (err) {
    return err.stack;
  }
};

const create = (request, response) => {
  //   const { id, name } = request.body;

  //   console.log(request.body);
  pool.query(
    "INSERT INTO " +
      table +
      " (" +
      columns.toString() +
      ") VALUES (" +
      Object.values(request.body).toString() +
      ")",
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(201).send(`User added with ID: ${results.insertId}`);
    }
  );
};

const update = (request, response) => {
  const id = parseInt(request.params.id);
  const { name } = request.body;

  pool.query(
    "UPDATE " + table + " SET id = $1, name = $2 WHERE  " + pk + " = $1",
    [id, name],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).send(`User modified with ID: ${id}`);
    }
  );
};

const updateFromEsp = (data) => {
  // console.log(data);

  let q = "";
  let dataArray = Object.values(data);

  columns.forEach((col, index) => {
    q = q + col + "=";
    q = q + "$" + (index + 1) + ",";
  });

  pool.query(
    "UPDATE " +
      table +
      " SET " +
      q.substring(0, q.length - 1) +
      " WHERE  " +
      pk +
      " = $1",
    dataArray,
    (error, results) => {
      if (error) {
        throw error.message;
      }
      // response.status(200).send(`User modified with ID: ${id}`);
    }
  );
};

const remove = (request, response) => {
  const id = parseInt(request.params.id);

  pool.query(
    "DELETE FROM " + table + " WHERE  " + pk + " = $1",
    [id],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).send(`User deleted with ID: ${id}`);
    }
  );
};

module.exports = {
  get,
  getById,
  getByIdSingleParam,
  create,
  update,
  remove,
  updateFromEsp,
};
