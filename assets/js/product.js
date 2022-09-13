import { Product } from "./module/product.js";

/**
 *
 * @type {Map<BigInt, Product>}
 */
let ps;

export const load_menu = async (type) => {
  await Product.get_all().then((d) => (ps = d));

  const menu_products = document.querySelector("#menu-products");
  const template = document.querySelector("#template-menu").content;
  const fragment = document.createDocumentFragment();

  for (const [num, p] of ps) {
    console.log(p);
    template.querySelector(".menu-content a").textContent = p.name;
    template.querySelector(".menu-content a").href = p.url;
    template.querySelector("span").textContent = `$${p.price}`;
    template.querySelector(".menu-ingredients").textContent = p.description;
    template.querySelector(
      ".menu-item"
    ).classList = `col-lg-6 menu-item base-${p.base} name-${p.id}`;
    const clone = template.cloneNode(true);
    fragment.appendChild(clone);
  }

  menu_products.appendChild(fragment);

  var menuIsotope = $(".menu-container").isotope({
    itemSelector: ".menu-item",
    layoutMode: "fitRows",
  });

  $("#search-product-name-form button").on("click", function () {
    const form = document.getElementById("search-product-name-form");
    const ids = search_product(form["search"].value);
    console.log("encontradoL: ", ids);
    menuIsotope.isotope({
      filter: ids,
    });
  });
  $(".venobox").venobox();
};

/**
 *
 * @param {Map<BigInt, Product>} ps
 */
export const search_product = (name) => {
  /**
   * @type {String}
   */
  let ids = "";
  ps.forEach((v, k) => {
    if (v.name.toLowerCase().includes(name)) {
      if (ids) {
        ids += `, .name-${k}`;
      } else {
        ids += `.name-${k}`;
      }
    }
  });
  return ids;
};

// window.search_product_name = () => {
//   console.log("buscando");
//   const form = document.getElementById("search-product-name-form");
//   const ids = search_product(form["search"].value);
//   console.log("encontradoL: ", ids);
//   $("#menu-flters li").removeClass("filter-active");
//   //$(this).addClass("filter-active");

//   menuIsotope.isotope({
//     filter: ids,
//   });
// };

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
