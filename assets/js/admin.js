import { load_menu } from "./product.js";
import { validate_email } from "./module/user.js";

window.createProduct = () => {
    let nombre = document.getElementById("nombre").value;
    let precio = document.getElementById("precio").value;
    let descripcion = document.getElementById("desc").value;
    let base = document.getElementById("base").value;

    if (!nombre) {
        throw Error("Ingresa un nombre para el producto");
    }
    if (!precio) {
        throw Error("Ingresa un precio para el producto");
    }
    if (!descripcion) {
        throw Error("Ingresa una descripción para el producto");
    }
    if (base === 'Selecciona una opción') {
        throw Error("Ingresa una base para el producto");
    }
    else {
        console.log(`${nombre} ${precio} ${descripcion} ${base}`);
    }
}

window.createEstablishment = () => {
    let calle = document.getElementById("calleCE").value;
    let numero = document.getElementById("numCE").value;
    let colonia = document.getElementById("colCE").value;
    let ciudad = document.getElementById("ciudadCE").value;
    let codigoPostal = document.getElementById("cpCE").value;
    let estado = document.getElementById("estadoCE").value;
    let pais = document.getElementById("paisCE").value;

    if (!calle) {
        throw Error("Ingresa una calle para el establecimiento");
    }
    if (!numero) {
        throw Error("Ingresa un numero para el establecimiento");
    }
    if (!colonia) {
        throw Error("Ingresa una colonia para el establecimiento");
    }
    if (!ciudad) {
        throw Error("Ingresa una ciudad para el establecimiento");
    }
    if (!codigoPostal) {
        throw Error("Ingresa un código postal para el establecimiento");
    }
    if (!estado) {
        throw Error("Ingresa un estado para el establecimiento");
    }
    if (!pais) {
        throw Error("Ingresa un pais para el establecimiento");
    }
    else {
        console.log(`${calle} ${numero} ${colonia} ${ciudad} ${codigoPostal} ${estado} ${pais}`);
    }
}

window.hireAdmin = () => {
    let email = document.getElementById("emailCA").value;
    let salario = document.getElementById("salarioCA").value;

    if (!email) {
        throw Error("Ingresa un correo electrónico para el administrador");
    }
    if (!validate_email(email)) {
        throw Error("Ingresa un correo electrónico válido");
    }
    if (!salario) {
        throw Error("Ingresa un salario para el administrador");
    }
    else {
        console.log(`${email} ${salario}`);
    }
}

window.onload = function () {
    load_menu();
}