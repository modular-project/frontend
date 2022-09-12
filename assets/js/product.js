import { Product } from "./module/product.js";

export const BASES = [
  "apple_pie",
  "baklava",
  "beef_carpaccio",
  "beignets",
  "bread_pudding",
  "breakfast_burrito",
  "caesar_salad",
  "caprese_salad",
  "carrot_cake",
  "cheesecake",
  "chicken_curry",
  "chicken_wings",
  "chocolate_cake",
  "churros",
  "clam_chowder",
  "club_sandwich",
  "creme_brulee",
  "deviled_eggs",
  "donuts",
  "eggs_benedict",
  "falafel",
  "filet_mignon",
  "foie_gras",
  "french_fries",
  "french_toast",
  "fried_calamari",
  "fried_rice",
  "garlic_bread",
  "greek_salad",
  "grilled_salmon",
  "guacamole",
  "hamburger",
  "hot_dog",
  "huevos_rancheros",
  "ice_cream",
  "lasagna",
  "lobster_bisque",
  "macaroni_and_cheese",
  "macarons",
  "miso_soup",
  "nachos",
  "omelette",
  "onion_rings",
  "oysters",
  "paella",
  "pancakes",
  "panna_cotta",
  "peking_duck",
  "pizza",
  "pork_chop",
  "poutine",
  "prime_rib",
  "pulled_pork_sandwich",
  "ramen",
  "ravioli",
  "red_velvet_cake",
  "risotto",
  "samosa",
  "sashimi",
  "scallops",
  "shrimp_and_grits",
  "spaghetti_bolognese",
  "spaghetti_carbonara",
  "spring_rolls",
  "steak",
  "strawberry_shortcake",
  "sushi",
  "tacos",
  "takoyaki",
  "tiramisu",
  "waffles",
];

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
