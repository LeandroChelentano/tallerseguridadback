const express = require("express");
let router = express.Router();
const sql = require("../connection");

const validations = require("../validation");

const { SHA256 } = require("sha2");

const LOG = (msg) => {
  const tmp = new Date();
  const zone = "es-UY";
  const date = tmp.toLocaleDateString(zone);
  const time = tmp.toLocaleTimeString(zone);
  console.log(`[${date} ${time}] - ${msg}`);
};

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

  LOG(`Intento de login [${user} - ${pass}]`);

  if (validations.validateString(user) || validations.validateString(pass)) {
    LOG(`Caracteres prohibidos [${user} - ${pass}]`);
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
    LOG(`Intento de inicio de sesion con cuenta bloqueada [${user} - ${pass}]`);
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
    LOG(
      `Intento de inicio de sesion con credenciales incorrectas [${user} - ${pass}]`
    );
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

  LOG(`Sesion iniciada correctamente [${user} - ${pass}]`);

  res.send({
    status: true,
    message: "Sesión iniciada.",
    token: token,
  });
});

router.post("/register", async (req, res) => {
  const { user, pass } = req.body;

  LOG(`Intento de registro [${user} - ${pass}]`);

  if (
    validations.validateStringLength(user, 30, 4) ||
    validations.validateStringLength(pass, 30, 8)
  ) {
    LOG(
      `Intento de registro con credenciales de largo incorrecto [${user} - ${pass}]`
    );
    res.send({
      status: false,
      message:
        "El usuario debe tener de 4 a 30 caracteres y contraseña debe entre 8 y 30.",
    });
    return;
  }

  if (validations.validateString(user) || validations.validateString(pass)) {
    LOG(
      `Intento de registro con credenciales con caracteres prohibidos [${user} - ${pass}]`
    );
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
    LOG(`Intento de registro con usuario ya existente [${user} - ${pass}]`);
    res.send({ status: false, message: "Ese usuario se encuenta en uso." });
    return;
  }

  const encryptedPass = encrypt(pass);
  const token = generateToken();
  await sql.query(
    `INSERT INTO Usuarios (Usuario, Contrasena, EsAdmin, Token) VALUES (?, ?, ?, ?);`,
    [user, encryptedPass, false, token]
  );

  LOG(`Registro exitoso [${user} - ${pass}]`);

  res.send({
    status: true,
    message: "Cuenta creada con exito.",
    token: token,
  });
});

router.post("/token", async (req, res) => {
  const { token } = req.body;

  LOG(`Intento de validacion de token [${token}]`);

  if (!token) {
    LOG(`token con formato incorrecto [${token}]`);
    res.send({
      status: false,
      message: "El token tiene un formato incorrecto.",
    });
    return;
  }

  if (token.length != 30) {
    LOG(`Token de largo incorrecto [${token}]`);
    res.send({
      status: false,
      message: "Token incorrecto.",
    });
    return;
  }

  if (validations.validateString(token)) {
    LOG(`Token con carateres prohibidos [${token}]`);
    res.send({
      status: false,
      message: "Token incorrecto.",
    });
    return;
  }

  const user = await sql.query(
    `SELECT Usuario FROM Usuarios WHERE Token = ?;`,
    [token]
  );

  if (user[0] === undefined) {
    LOG(`Intento de validacion de token no existente [${token}]`);
    res.send({ status: false, message: "Token incorrecto." });
    return;
  }

  LOG(`Token validado correctamente [${token}]`);

  res.send({
    status: true,
    message: "Token validado.",
  });
});

router.delete("/token", async (req, res) => {
  const { token } = req.body;

  LOG(`Intento de cerrar sesion con token [${token}]`);

  if (!token) {
    LOG(`token con formato incorrecto [${token}]`);
    res.send({
      status: false,
      message: "El token tiene un formato incorrecto.",
    });
    return;
  }

  if (token.length != 30) {
    LOG(`Token de largo incorrecto [${token}]`);
    res.send({
      status: false,
      message: "Token incorrecto.",
    });
    return;
  }

  if (validations.validateString(token)) {
    LOG(`Token con carateres prohibidos [${token}]`);
    res.send({
      status: false,
      message: "Token incorrecto.",
    });
    return;
  }

  await sql.query(`UPDATE Usuarios SET Token = ?;`, [null]);

  LOG(`Sesion cerrada correctamente [${token}]`);

  res.send({
    status: true,
    message: "Sesion cerrada correctamente.",
  });
});

module.exports = router;
