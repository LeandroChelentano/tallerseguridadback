const validateString = (txt) => {
  const whitelist = [
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
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
  ];

  let notValid = false;
  txt
    .toLowerCase()
    .split("")
    .forEach((letter) => {
      if (whitelist.indexOf(letter) == -1) notValid = true;
    });
  return notValid;
};

const validateStringLength = (text, max, min) =>
  text.length > max || text.length < min;

module.exports = { validateString, validateStringLength };
