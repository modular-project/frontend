import { Product } from "./module/product.js";
import { upload_to_classify } from "./module/image.js";

/**
 *
 * @type {Map<BigInt, Product>}
 */
let ps = new Map();

/**
 *
 * @type {Map<BigInt, Product>}
 */
const ps_deletes = new Map();

let offset_p = 0;
let max_pages = 0;
const limit_p = 10;
var menuIsotope;

let is_by_name = true;
let lasted_value = "";

export const load_menu = async (func, modal = "") => {
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
    if (modal) {
      template
        .querySelector(".menu-content a")
        .setAttribute("data-toggle", "modal");
      template
        .querySelector(".menu-content a")
        .setAttribute("data-target", `#${modal}`);
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
  max_pages = Math.ceil(ps.size / limit_p);
  menuIsotope = $(".menu-container").isotope({
    itemSelector: ".menu-item",
    layoutMode: "fitRows",
  });
  load_pag_bar();
  pag_product(0);

  $("#search-product-name-form button").on("click", function () {
    is_by_name = true;
    const form = document.getElementById("search-product-name-form");
    search_product(form["search"].value);
    lasted_value = form["search"].value;
    // max_pages = Math.ceil(ps.size / limit_p);
    // menuIsotope.isotope({
    //   filter: ids,
    // });
    load_pag_bar();
    pag_product(0);
  });

  $("#search-product-base-form button").on("click", async function () {
    is_by_name = false;
    const b_id = await classify_img();
    lasted_value = b_id;
    search_by_base(b_id);
    // menuIsotope.isotope({
    //   filter: ids,
    // });
    load_pag_bar();
    pag_product(0);
  });
  if (!func) {
    $(".venobox").venobox();
  }
};

export const search_product = (name) => {
  /**
   * @type {String}
   */
  let ids = "";
  let ids_a = [];
  ps.forEach((v, k) => {
    if (v.name.toLowerCase().includes(name.toLowerCase())) {
      ids_a.push(`.name-${k}`);
    }
  });

  if (!ids_a.length) {
    max_pages = 0;
    return ".none";
  }
  let na = ids_a.slice(offset_p * limit_p, offset_p * limit_p + limit_p);
  max_pages = Math.ceil(ids_a.length / limit_p);
  na.forEach(function (item, index) {
    if (ids) {
      ids += `, ${item}`;
    } else {
      ids += `${item}`;
    }
  });
  return ids;
};

const generate_items_pag = () => {
  let i = 0;
  let s = "";
  while (i < max_pages) {
    s += `<li class="page-item pag-${i}"><a class="page-link" href="#" onclick="pag_product('${i}'); return false;">${
      i + 1
    }</a></li>`;
    i += 1;
  }
  return s;
};

const load_pag_bar = () => {
  if (!max_pages) {
    document.getElementById("product-pag").innerHTML = "";
    return;
  }
  const s = generate_items_pag();
  document.getElementById("product-pag").innerHTML = `
  <ul class="pagination justify-content-center">
    <li class="page-item pag-prev disabled">
      <a class="page-link" href="#" aria-label="Previous" onclick="pag_prev(); return false;">
        <span aria-hidden="true">&laquo;</span>
        <span class="sr-only">Previous</span>
      </a>
    </li>
    ${s}
    <li class="page-item pag-next">
      <a class="page-link" href="#" aria-label="Next" onclick="pag_next(); return false;">
        <span aria-hidden="true">&raquo;</span>
        <span class="sr-only">Next</span>
      </a>
    </li>
  </ul>
  `;
};

window.pag_next = () => {
  pag_product(offset_p + 1);
};

window.pag_prev = () => {
  pag_product(offset_p - 1);
};

const pag_product = (offset) => {
  if (!max_pages) {
    menuIsotope.isotope({
      filter: ".none",
    });
    return;
  }
  offset_p = parseInt(offset);
  if (offset_p == 0) {
    document
      .getElementById("product-pag")
      .getElementsByClassName("pag-prev")[0]
      .classList.toggle("disabled", true);
  } else {
    document
      .getElementById("product-pag")
      .getElementsByClassName("pag-prev")[0]
      .classList.toggle("disabled", false);
  }
  if (offset_p == max_pages - 1) {
    document
      .getElementById("product-pag")
      .getElementsByClassName("pag-next")[0]
      .classList.toggle("disabled", true);
  } else {
    document
      .getElementById("product-pag")
      .getElementsByClassName("pag-next")[0]
      .classList.toggle("disabled", false);
  }
  let active = document
    .getElementById("product-pag")
    .getElementsByClassName("page-item active");
  if (active.length) {
    active[0].classList.remove("active");
  }
  document.getElementsByClassName(`pag-${offset}`)[0].classList.add("active");
  // const form = document.getElementById("search-product-name-form");
  let ids = "";
  if (is_by_name) {
    ids = search_product(lasted_value);
  } else {
    ids = search_by_base(lasted_value);
  }
  menuIsotope.isotope({
    filter: ids,
  });
};

window.pag_product = pag_product;

const search_by_base = (base_id) => {
  /**
   * @type {String}
   */
  let ids = "";
  ps.forEach((v, k) => {
    if (v.base == base_id) {
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

const classify_img = async () => {
  return await upload_to_classify(
    document.getElementById("form-img").files[0]
  ).then((r) => {
    return r.id;
  });
};

export const product_by_id = (id) => {
  return ps.get(id);
};

export const add_product = (p) => {
  ps.set(p.id, p);
};

const storage_deletes = () => {
  const deletes = [];
  for (const [key, value] of ps_deletes) {
    if (value) {
      deletes.push(value.data);
    }
  }
  let del = JSON.stringify(deletes);
  window.localStorage.setItem("p_deletes", del);
};

/**
 *
 * @param {number[]} ids
 */
export const get_deletes = async (ids) => {
  let deletes = window.localStorage.getItem("p_deletes");
  /**
   * @type {Product[]}
   */
  let deletesObj;
  if (deletes) {
    deletesObj = JSON.parse(deletes);
    deletesObj.forEach(function (item, index) {
      if (item) {
        ps_deletes.set(item.id, new Product(item));
      }
    });
  }
  let news = [];
  ids.forEach(function (item, index) {
    let p = get_product_delete(parseInt(item));
    if (!p) {
      news.push(item);
    }
  });

  if (news.length) {
    await Product.get_in_batch(ids).then((d) => {
      for (const [k, val] of d) {
        ps_deletes.set(k, val);
      }
    });

    storage_deletes();
  }
};

window.product_pagination = (offset, limit) => {
  document.getElementsByClassName("");
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
