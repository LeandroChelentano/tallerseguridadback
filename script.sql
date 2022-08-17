CREATE DATABASE todoofertas;

USE todoofertas;

CREATE TABLE Usuarios (
  Usuario VARCHAR(30) PRIMARY KEY,
  Contrasena VARCHAR(70) NOT NULL,
  EsAdmin BOOLEAN DEFAULT(FALSE),
  Token VARCHAR(30) NOT NULL UNIQUE
);

CREATE TABLE LoginLogs (
  Id INT AUTO_INCREMENT PRIMARY KEY,
  Usuario VARCHAR(30) REFERENCES Usuarios(Usuario)
);