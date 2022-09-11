import { load_menu } from "./product.js";

function createProduct() {
    let nombre = document.getElementById("nombre").value;
    let precio = document.getElementById("precio").value;
    let descripcion = document.getElementById("desc").value;
    let base = document.getElementById("base").value;
    
    console.log(`${nombre} ${precio} ${descripcion} ${base}`);
}

window.onload = function () {
    load_menu();
}