CREATE DATABASE todoofertas;
USE todoofertas;

--regin mysql
CREATE TABLE Usuarios (
  Usuario VARCHAR(30) PRIMARY KEY,
  Contrasena VARCHAR(70) NOT NULL,
  EsAdmin BOOLEAN DEFAULT(FALSE),
  Token VARCHAR(30) NOT NULL UNIQUE
);

CREATE TABLE LoginLogs (
  Id INT AUTO_INCREMENT PRIMARY KEY,
  Usuario VARCHAR(30) REFERENCES Usuarios(Usuario)
)
--endregion mysql

--region sql server
CREATE TABLE Usuarios (
  Usuario VARCHAR(30) PRIMARY KEY,
  Contrasena VARCHAR(70) NOT NULL,
  EsAdmin BOOLEAN DEFAULT(FALSE),
  Token VARCHAR(30) NOT NULL UNIQUE
);

CREATE TABLE LoginLogs (
  Id INT IDENTITY(0,1) PRIMARY KEY,
  Usuario VARCHAR(30) REFERENCES Usuarios(Usuario)
);
--endregion