import { Product } from "./module/product.js";

/**
 *
 * @type {Map<BigInt, Product>}
 */
let ps;

/**
 *
 * @type {Map<BigInt, Product>}
 */
let ps_deletes = new Map();

export const load_menu = async (func) => {
  await Product.get_all().then((d) => (ps = d));
  const menu_products = document.querySelector("#menu-products");
  const template = document.querySelector("#template-menu").content;
  const fragment = document.createDocumentFragment();
  for (const [num, p] of ps) {
    template.querySelector(".menu-content a").textContent = p.name;
    if (func) {
      template.querySelector(".menu-content a").href = "";
      template
        .querySelector(".menu-content a")
        .setAttribute("onclick", `${func}('${num}');return false;`);
    } else {
      template.querySelector(".menu-content a").href = p.url;
    }

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

  if (!func) {
    $("#search-product-name-form button").on("click", function () {
      const form = document.getElementById("search-product-name-form");
      const ids = search_product(form["search"].value);
      menuIsotope.isotope({
        filter: ids,
      });
    });
    $(".venobox").venobox();
  }
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
    if (v.name.toLowerCase().includes(name.toLowerCase())) {
      if (ids) {
        ids += `, .name-${k}`;
      } else {
        ids += `.name-${k}`;
      }
    }
  });
  if (!ids) {
    return ".none";
  }
  return ids;
};

window.classify_img = async () => {
  await upload_to_classify(document.getElementById("form-img").files[0]);
};

export const product_by_id = (id) => {
  return ps.get(id);
};

export const add_product = (p) => {
  ps.set(p.id, p);
};

export const get_deletes = async (ids) => {
  await Product.get_in_batch(ids).then((d) => {
    for (const [k, val] of d) {
      ps_deletes.set(k, val);
    }
  });
};

export const get_product_delete = (id) => {
  return ps_deletes.get(parseInt(id));
};

// const load = async () => {
//   /**
//    *
//    * @type {Map<BigInt, Product>}
//    */
//   let ps;
//   await Product.get_all().then((d) => (ps = d));

//   const menu_products = document.querySelector("#menu-products");
//   const template = document.querySelector("#template-menu").content;
//   const fragment = document.createDocumentFragment();

//   for (const [num, p] of ps) {
//     console.log(p);
//     template.querySelector(".menu-content a").textContent = p.name;
//     template.querySelector("span").textContent = p.price;
//     template.querySelector(".menu-ingredients").textContent = p.description;
//     const clone = template.cloneNode(true);
//     fragment.appendChild(clone);
//   }

//   menu_products.appendChild(fragment);
//   var menuIsotope = $(".menu-container").isotope({
//     itemSelector: ".menu-item",
//     layoutMode: "fitRows",
//   });
// };
