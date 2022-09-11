import { upload_to_classify } from "./module/image.js";
import { Product } from "./module/product.js";

window.classify_img = async () => {
  await upload_to_classify(document.getElementById("form-img").files[0]);
};

const load = async () => {
  /**
   *
   * @type {Map<BigInt, Product>}
   */
  let ps;
  await Product.get_all().then((d) => (ps = d));

  const menu_products = document.querySelector("#menu-products");
  const template = document.querySelector("#template-menu").content;
  const fragment = document.createDocumentFragment();

  for (const [num, p] of ps) {
    console.log(p);
    template.querySelector(".menu-content a").textContent = p.name;
    template.querySelector("span").textContent = p.price;
    template.querySelector(".menu-ingredients").textContent = p.description;
    const clone = template.cloneNode(true);
    fragment.appendChild(clone);
  }

  menu_products.appendChild(fragment);
  var menuIsotope = $(".menu-container").isotope({
    itemSelector: ".menu-item",
    layoutMode: "fitRows",
  });
};

window.onload = async () => {
  await load();
};

const bases = {
  0: "P1",
  1: "p2",
};
