import { validate_email, validate_password } from "./module/user.js";

window.updateNumTables = () => {
  let direccion = document.getElementById("dirACM").value;
  let cantidadMesas = document.getElementById("mesasACM").value;

  if (!direccion) {
    throw Error("Ingresa una dirección para el establecimiento");
  }
  if (!cantidadMesas) {
    throw Error("Ingresa una cantidad de mesas para el establecimiento");
  } else {
    console.log(
      `${direccion} ${cantidadMesas}`
    );
  }
}

window.hireManagerCook = () => {
  let email = document.getElementById("emailCGM").value;
  let salario = document.getElementById("salarioCGM").value;

  if (!email) {
    throw Error("Ingresa un correo electrónico para el administrador");
  }
  if (!validate_email(email)) {
    throw Error("Ingresa un correo electrónico válido");
  }
  if (!salario) {
    throw Error("Ingresa un salario para el administrador");
  } else {
    console.log(`${email} ${salario}`);
  }
}

window.createCookAccount = () => {
  let uname = document.getElementById("unameCCC").value;
  let password = document.getElementById("passCCC").value;

  if (!uname) {
    throw Error("Ingresa un nombre de usuario");
  }
  if (uname.length < 5) {
    throw Error("El nombre de usuario debe tener al menos 5 caracteres");
  }
  if (!password) {
    throw Error("Ingresa una contraseña");
  }
  if (!validate_password(password)) {
    throw Error("Ingresa una contraseña válida");
  } else {
    console.log(`${uname} ${password}`);
  }
}