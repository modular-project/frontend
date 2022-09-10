import { Product } from "./module/product.js";

/**
*  
* @param {Product} p 
* @returns 
*/
const product_to_html = (p) => {
    return `<div class="col-lg-6 menu-item">
    <div class="menu-content">
    <a href="#">${p.name}</a><span>$${p.price}</span>
    </div>
    <div class="menu-ingredients">
    ${p.description}
    </div>
    </div>`
}

// async function get_all() {
//     /**
//     *
//     * @type {Map<BigInt, Product>}
//     */
//     let prod;
//     await Product.get_all().then(d => prod = d);
//     // console.log(prod.size);
//     // prod.forEach((value, key) => {
//     //     console.log(`${key} = ${value}`);
//     // });
//     // for (const [num, p] of prod) {
//     //     console.log(num, p);
//     // }
//     for (const [num, p] of prod) {
//         document.getElementById("menu-products").innerHTML += product_to_html(p);
//         console.log(num, p);
//     }
// }

const load = async () => {
    /**
    * 
    * @type {Map<BigInt, Product>}
    */
    let ps;
    await Product.get_all().then((d) => (ps = d));

    for (const [num, p] of ps) {
        document.getElementById("menu-products").innerHTML += product_to_html(p)
    }
}

window.onload = function () {
    load();
}