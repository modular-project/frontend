import { API_URL, get_token, ERROR_UNAUTHORIZED } from "./utils.js";

const API_URL_PRODUCT = `${API_URL}/api/v1/product/`;

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

  /**
   *
   * @returns {BigInt}
   */
  async save() {
    let t = get_token();
    if (!t) {
      throw ERROR_UNAUTHORIZED;
    }
    return await fetch(`${API_URL_PRODUCT}`, {
      headers: { Authorization: t, "Content-Type": "application/json" },
      body: this.data,
      method: "POST",
    }).then((r) => {
      if (!r.ok) {
        throw r;
      }
      let id;
      r.json((data) => (id = data["id"]));
      return id;
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
        throw r;
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
    return await fetch(`${API_URL_PRODUCT}`).then((r) => {
      if (!r.ok) {
        throw r;
      }
      const ps = new Map();
      r.json().then((data) => {
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
    }).then((r) => {
      if (!r.ok) {
        throw r;
      }
      const ps = new Map();
      r.json().then((data) => {
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
    }).then((r) => {
      if (!r.ok) {
        throw r;
      }
      let id;
      r.json((data) => (id = data["id"]));
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
        throw r;
      }
    });
  }
}

// let p = new Product({"name":"test"})
// console.log(p.name, "gola");
// console.log("asdasd");

// window.localStorage.setItem("token", "Bearer asdeqwasdaseqwe123123wdqw.eqweqw")

// let p2 = Product.get_by_id(2)
