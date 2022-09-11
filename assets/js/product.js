import { Product } from "./module/product.js";

const load = async () => {
    /**
    * 
    * @type {Map<BigInt, Product>}
    */
    let ps;
    await Product.get_all().then((d) => (ps = d));

    // for (const [num, p] of ps) {
    //     document.getElementById("menu-products").innerHTML += product_to_html(p)
    // }

    const menu_products = document.querySelector('#menu-products');
    const template = document.querySelector('#template-menu').content;
    const fragment = document.createDocumentFragment();

    for (const [num, p] of ps) {
        console.log(p);
        template.querySelector('.menu-content a').textContent = p.name;
        template.querySelector('span').textContent = p.price;
        template.querySelector('.menu-ingredients').textContent = p.description;
        const clone = template.cloneNode(true);
        fragment.appendChild(clone);
    }

    menu_products.appendChild(fragment);

    // var menuIsotope = $(".menu-container").isotope({
    //     itemSelector: ".menu-item",
    //     layoutMode: "fitRows",
    // });
}

window.onload = function () {
    load();
}