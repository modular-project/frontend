import {
  API_URL,
  get_token,
  ERROR_UNAUTHORIZED,
  new_response_error,
} from "./utils.js";

const API_URL_PRODUCT = `${API_URL}/api/v1/product/`;

export const BASES = [
  "Pay de manzana",
  "Baklava",
  "Carpaccio de res",
  "Beignets",
  "Pudding",
  "Burrito",
  "Ensalada Cesar",
  "Ensalada caprese",
  "Pastel de zanahoria",
  "Pastel de queso",
  "Pollo al curri",
  "Alitas",
  "Pastel de chocolate",
  "Churros",
  "Clam chowder",
  "Club sandwich",
  "Creme brulee",
  "Huevos rellenos",
  "Donas",
  "Huevos benedict",
  "Falafel",
  "Filete mignon",
  "Foie gras",
  "Papas fritas",
  "Pan tostado",
  "Calamar frito",
  "Arroz frito",
  "Pan de ajo",
  "Ensalada griega",
  "Salmon a la parrilla",
  "Guacamole",
  "Hamburgesa",
  "Hot dog",
  "Huevos rancheros",
  "Helado",
  "Lasagna",
  "Bisque de langosta",
  "Macarrones con queso",
  "Macaron",
  "Sopa de miso",
  "Nachos",
  "Omelette",
  "Aroz de cebolla",
  "Ostras",
  "Paella",
  "Panqueques",
  "Panna cotta",
  "Pato laqueado",
  "Pizza",
  "Chuleta de cerdo",
  "Poutine",
  "Costilla asada",
  "Sandwich de cerdo",
  "Ramen",
  "Ravioli",
  "Pastel de red velvet",
  "Risotto",
  "Samosa",
  "Sashimi",
  "Vieiras",
  "Camarones con semola",
  "Espagueti a la boloñesa",
  "Espagueti a la carbonara",
  "Rollitos primavera",
  "Filete",
  "Shortcake de fresa",
  "Sushi",
  "Tacos",
  "Takoyaki",
  "Tiramisu",
  "Waffles",
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
    return this.data["base_id"];
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
      },
      body: JSON.stringify(this.data),
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
      body: JSON.stringify(this.data),
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

  static async delete_by_id(id) {
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
