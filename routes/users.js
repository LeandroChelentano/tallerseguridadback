const express = require("express");
let router = express.Router();
const sql = require("../connection");

const validations = require("../validation");

const { SHA256 } = require("sha2");

const encrypt = (pass) => {
  return SHA256(pass).toString("hex");
};

const generateToken = () => {
  const letters = [
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h",
    "i",
    "j",
    "k",
    "l",
    "m",
    "n",
    "o",
    "p",
    "q",
    "r",
    "s",
    "t",
    "u",
    "v",
    "w",
    "x",
    "y",
    "z",
  ];
  const numbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
  const letterornumber = new Array(30);
  for (let i = 0; i < 30; i++)
    letterornumber[i] = Math.floor(Math.random() * 2) === 0;

  let cadena = "";
  letterornumber.forEach((isNumber) => {
    if (isNumber) {
      let number = numbers[Math.floor(Math.random() * 10)];
      cadena += number;
    } else {
      let letra = letters[Math.floor(Math.random() * 26)];
      if (Math.floor(Math.random() * 2) === 0) letra = letra.toUpperCase();
      cadena += letra;
    }
  });
  return cadena;
};

router.post("/login", async (req, res) => {
  const { user, pass } = req.body;

  if (validations.validateString(user) || validations.validateString(pass)) {
    res.send({
      status: false,
      message: "El usuario y la contraseña solo pueden tener numeros y letras.",
    });
    return;
  }

  const attempts = await sql.query(
    `SELECT Count(*) AS Attempts FROM LoginLogs WHERE Usuario = ?;`,
    [user]
  );
  if (attempts[0].Attempts > 5) {
    res.send({
      status: false,
      message:
        "Cuenta bloqueada, se ha excedido el numero de intentos permitidos.",
    });
    return;
  }

  const encryptedPass = encrypt(pass);

  const exists = await sql.query(
    `SELECT Usuario FROM Usuarios WHERE Usuario = ? AND Contrasena = ?;`,
    [user, encryptedPass]
  );

  if (exists.length == 0) {
    await sql.query(`INSERT INTO LoginLogs (Usuario) VALUES (?);`, [user]);
    res.send({ status: false, message: "Credenciales incorrectas." });
    return;
  }

  await sql.query(`DELETE FROM LoginLogs WHERE Usuario = ?;`, [user]);

  const token = generateToken();
  await sql.query(
    `UPDATE Usuarios SET Token = ? WHERE Usuario = ? AND Contrasena = ?;`,
    [token, user, encryptedPass]
  );

  res.send({
    status: true,
    message: "Sesión iniciada.",
    token: token,
  });
});

router.post("/register", async (req, res) => {
  const { user, pass } = req.body;

  if (
    validations.validateStringLength(user, 30, 4) ||
    validations.validateStringLength(pass, 30, 8)
  ) {
    res.send({
      status: false,
      message:
        "El usuario debe tener de 4 a 30 caracteres y contraseña debe entre 8 y 30.",
    });
    return;
  }

  if (validations.validateString(user) || validations.validateString(pass)) {
    res.send({
      status: false,
      message: "El usuario y la contraseña solo pueden tener numeros y letras.",
    });
    return;
  }

  const inUse = await sql.query(`SELECT * FROM Usuarios WHERE Usuario = ?;`, [
    user,
  ]);

  if (inUse.length !== 0) {
    res.send({ status: false, message: "Credenciales incorrectas." });
    return;
  }

  const encryptedPass = encrypt(pass);
  const token = generateToken();
  await sql.query(
    `INSERT INTO Usuarios (Usuario, Contrasena, EsAdmin, Token) VALUES (?, ?, ?, ?);`,
    [user, encryptedPass, false, token]
  );

  res.send({
    status: true,
    message: "Cuenta creada con exito.",
    token: token,
  });
});

router.post("/token", async (req, res) => {
  const { token } = req.body;

  if (!token) {
    res.send({
      status: false,
      message: "El token tiene un formato incorrecto.",
    });
    return;
  }

  if (token.length != 30) {
    res.send({
      status: false,
      message:
        "El usuario debe tener de 4 a 30 caracteres y contraseña debe entre 8 y 30.",
    });
    return;
  }

  if (validations.validateString(token)) {
    res.send({
      status: false,
      message: "El usuario y la contraseña solo pueden tener numeros y letras.",
    });
    return;
  }

  const user = await sql.query(
    `SELECT Usuario FROM Usuarios WHERE Token = ?;`,
    [token]
  );

  if (user[0] === undefined) {
    res.send({ status: false, message: "Token incorrecto." });
    return;
  }

  res.send({
    status: true,
    message: "Token validado.",
  });
});

module.exports = router;
