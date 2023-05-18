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

const table = "users";
const columns = ["id", "name"];
const pk = columns[0];

const getUsers = (request, response) => {
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

const getUserById = (request, response) => {
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

const createUser = (request, response) => {
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

const updateUser = (request, response) => {
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

const deleteUser = (request, response) => {
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
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
