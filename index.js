const express = require("express");
const app = express();

require("dotenv").config();

//* En un futuro para las imagenes
// app.use("/public", express.static("public"));

//* Cors usage
const cors = require("cors");
app.use("*", cors());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );
  res.setHeader("Access-Control-Allow-Credentials", true);

  next();
});

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ limit: "10MB" }));

const sql = require("./connection");

app.post("/products", async (req, res) => {
  //? Imagen por ahora no
  const { titulo, descripcion, precio, imgs } = req.body;

  //* Variable a retornar
  const somethingWrong = false;

  //Validaciones con las funciones de arriba

  res.send({ status: somethingWrong });
});

app.get("/products", async (req, res) => {
  const { id } = req.query;

  if (!validateNum(id)) {
    res.send({ status: false, message: "Hay simbolos no permitidos." });
    return;
  }

  let data =
    id === undefined
      ? await sql.query("SELECT * FROM Productos;")
      : await sql.query("SELECT * FROM Productos WHERE Id = ?;", [id]);

  res.send({ data: data });
});

var usuariosRouter = require("./routes/users");
app.use("/users", usuariosRouter);

const PORT = 3001;
app.listen(PORT, console.log(`\n\tRunning on port: ${PORT}\n`));
