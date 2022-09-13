import { load_menu } from "./product.js";

window.createProduct = () => {
    let nombre = document.getElementById("nombre").value;
    let precio = document.getElementById("precio").value;
    let descripcion = document.getElementById("desc").value;
    let base = document.getElementById("base").value;

    if (!nombre) {
        throw Error("Ingresa un nombre para el producto");
    }
    else if (!precio) {
        throw Error("Ingresa un precio para el producto");
    }
    else if (!descripcion) {
        throw Error("Ingresa una descripción para el producto");
    }
    else if (base === 'Selecciona una opción') {
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
    else if (!numero) {
        throw Error("Ingresa un numero para el establecimiento");
    }
    else if (!colonia) {
        throw Error("Ingresa una colonia para el establecimiento");
    }
    else if (!ciudad) {
        throw Error("Ingresa una ciudad para el establecimiento");
    }
    else if (!codigoPostal) {
        throw Error("Ingresa un código postal para el establecimiento");
    }
    else if (!estado) {
        throw Error("Ingresa un estado para el establecimiento");
    }
    else if (!pais) {
        throw Error("Ingresa un pais para el establecimiento");
    }
    else {
        console.log(`${calle} ${numero} ${colonia} ${ciudad} ${codigoPostal} ${estado} ${pais}`);
    }
}

window.onload = function () {
    load_menu();
}