import {
  API_URL,
  get_token,
  ERROR_UNAUTHORIZED,
  new_response_error,
} from "./utils.js";

const API_URL_PRODUCT = `${API_URL}/api/v1/product/`;

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

export class Product {
  constructor(data) {
    this.data = data;
  }

  get id() {
    return this.data["id"];
  }
  get name() {
    return this.data["name"];
  }
  get url() {
    return this.data["url"];
  }
  get description() {
    return this.data["description"];
  }
  get price() {
    return this.data["price"];
  }
  get base() {
    return this.data["base"];
  }

  /**
   *
   * @returns {Promise<BigInt>}
   */
  async save() {
    let t = get_token();
    if (!t) {
      throw ERROR_UNAUTHORIZED;
    }
    return await fetch(`${API_URL_PRODUCT}`, {
      headers: {
        Authorization: t,
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: this.data,
      method: "POST",
    })
      .then(async (r) => {
        if (!r.ok) {
          throw new_response_error(r);
        }
        let id;
        await r.json((data) => (id = data["id"]));
        return id;
      })
      .catch((e) => {
        console.error(e);
        throw Error("No se pudo realizar la peticion");
      });
  }

  static async get_by_id(id) {
    let t = get_token();
    if (!t) {
      throw ERROR_UNAUTHORIZED;
    }
    return await fetch(`${API_URL_PRODUCT}${id}`, {
      headers: { Authorization: t },
    }).then((r) => {
      if (!r.ok) {
        throw new_response_error(r);
      }
      let data;
      r.json().then((d) => (data = d));
      return new Product(data);
    });
  }

  /**
   *
   * @returns {Promise<Map<BigInt, Product>>}
   */
  static async get_all() {
    return await fetch(`${API_URL_PRODUCT}`).then(async (r) => {
      let ps = new Map();
      if (!r.ok) {
        throw new_response_error(r);
      }
      await r.json().then((data) => {
        for (let d of data) {
          ps.set(d["id"], new Product(d));
        }
      });
      return ps;
    });
  }

  /**
   *
   * @param {BigInt[]} ids
   * @returns {Promise<Map<BigInt, Product>>}
   */
  static async get_in_batch(ids) {
    let t = get_token();
    if (!t) {
      throw ERROR_UNAUTHORIZED;
    }
    return await fetch(`${API_URL_PRODUCT}batch/`, {
      headers: { Authorization: t, "Content-Type": "application/json" },
      body: JSON.stringify({ ids: ids }),
      method: "POST",
    }).then(async (r) => {
      if (!r.ok) {
        throw new_response_error(r);
      }
      const ps = new Map();
      await r.json().then((data) => {
        for (let d of data) {
          ps.set(d["id"], new Product(d));
        }
      });
      return ps;
    });
  }

  /**
   *
   * @param {*} id
   * @returns {BigInt}
   */
  async update_by_id(id) {
    let t = get_token();
    if (!t) {
      throw ERROR_UNAUTHORIZED;
    }
    return await fetch(`${API_URL_PRODUCT}${id}`, {
      headers: { Authorization: t, "Content-Type": "application/json" },
      body: this.data,
      method: "PUT",
    }).then(async (r) => {
      if (!r.ok) {
        throw new_response_error(r);
      }
      let id;
      await r.json((data) => (id = data["id"]));
      return id;
    });
  }

  async delete_by_id(id) {
    let t = get_token();
    if (!t) {
      throw ERROR_UNAUTHORIZED;
    }
    await fetch(`${API_URL_PRODUCT}${id}`, {
      headers: { Authorization: t, "Content-Type": "application/json" },
      method: "DELETE",
    }).then((r) => {
      if (!r.ok) {
        throw new_response_error(r);
      }
    });
  }
}

// let p = new Product({"name":"test"})
// console.log(p.name, "gola");
// console.log("asdasd");

// window.localStorage.setItem("token", "Bearer asdeqwasdaseqwe123123wdqw.eqweqw")

// let p2 = Product.get_by_id(2)
