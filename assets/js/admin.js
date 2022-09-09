import { Product } from "./module/product.js";

async function get_all() {
    /**
    *
    * @type {Map<BigInt, Product>}
    */
    let prod;
    await Product.get_all().then((d) => (prod = d));
    console.log(prod);
}

window.onload = function () {
    get_all();
}