import { API_URL, new_response_error } from "./utils.js";
import { is_greater, ROLES } from "./employee.js";
const API_URL_ESTB = `${API_URL}/api/v1/establishment/`;

export class Search {
  /**
   *
   * @param {Map<string, any>} data
   */
  constructor(data, headers, limit, offset) {
    let order = [];
    let querys = [];
    let d, o, s, p;
    const filters = new Map();
    for (const h in headers) {
      if ((d = data.get(h))) {
        if ((s = d.search)) {
          querys.push({ key: h, val: `.*${s}.*` });
        }
        if ((o = d.order)) {
          if (o != "0") {
            order.push({ key: h, val: parseInt(o) });
          }
        }
      }
    }

    filters.set("default", { offset: offset, limit: limit });
    if (order.length) {
      filters.set("order_by", order);
    }
    if (querys.length) {
      filters.set("query", querys);
    }
    this.filters = filters;
  }
  get djson() {
    return JSON.stringify(Object.fromEntries(this.filters));
  }
}
export class Establishment {
  constructor(data) {
    this.data = data;
  }

  get id() {
    return this.data.id;
  }
  get street() {
    return this.data.line1;
  }
  get suburb() {
    return this.data.line2;
  }
  get city() {
    return this.data.city;
  }
  get pc() {
    return this.data.pc;
  }
  get state() {
    return this.data.state;
  }
  get country() {
    return this.data.country;
  }

  /**
   *
   * @returns {Promise<BigInt>}
   */
  async save(t, r_id) {
    if (!t) {
      throw ERROR_UNAUTHORIZED;
    }
    if (!is_greater(r_id, ROLES.Manager)) {
      throw Error("No tienes el rol necesario");
    }
    return await fetch(`${API_URL_ESTB}`, {
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

  /**
   * @param {Search} s
   */
  static async search(s, r_id, t) {
    if (!t) {
      throw ERROR_UNAUTHORIZED;
    }
    if (!is_greater(r_id, ROLES.Manager)) {
      throw Error("No tienes el rol necesario");
    }
    const estbs = new Map();
    await fetch(`${API_URL_ESTB}search/`, {
      body: s.djson,
      headers: {
        "Content-Type": "application/json;charset=utf-8",
        Authorization: t,
      },
      method: "POST",
    }).then(async (r) => {
      if (!r.ok) {
        throw new_response_error(r);
      }
      await r.json().then((data) => {
        for (let d of data) {
          estbs.set(d["id"], new Establishment(d));
        }
      });
    });
    return estbs;
  }
}
