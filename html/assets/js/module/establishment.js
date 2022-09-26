import { API_URL, new_response_error } from "./utils.js";
import { is_greater, ROLES } from "./employee.js";
const API_URL_ESTB = `${API_URL}/api/v1/establishment/`;

export class Table {
  constructor(data) {
    this.data = data;
  }

  get id() {
    return this.data.id;
  }
  get establishment_id() {
    return this.data.establishment_id;
  }
  get user_id() {
    return this.data.user_id;
  }
}
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
  constructor(data, q, id) {
    this.data = data;
    this.quantity = parseInt(q);
    this.id = id;
  }

  get address_Id() {
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
  get cuantity() {
    return this.quantity;
  }

  get stringer() {
    return `${this.street}, ${this.suburb}, ${this.city}, ${this.state}, ${this.country}, ${this.pc}`;
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

  // Returns id establishment and quantity tables
  static async get_by_address(aid, t) {
    if (!t) {
      throw ERROR_UNAUTHORIZED;
    }
    return await fetch(`${API_URL_ESTB}add/${aid}`, {
      headers: {
        Authorization: t,
      },
    }).then(async (r) => {
      if (!r.ok) {
        throw new_response_error(r);
      }
      return await r.json().then((data) => {
        console.log(data);
        return data;
      });
    });
  }

  // Returns address and quantity
  static async get_by_id(eid, t) {
    if (!t) {
      throw ERROR_UNAUTHORIZED;
    }
    return await fetch(`${API_URL_ESTB}${eid}`, {
      headers: {
        Authorization: t,
      },
    }).then(async (r) => {
      if (!r.ok) {
        throw new_response_error(r);
      }
      return await r.json().then((data) => {
        console.log(data);
        return new Establishment(data.address, data.quantity, eid);
      });
    });
  }

  static async get_tables(t, e_id) {
    if (!t) {
      throw ERROR_UNAUTHORIZED;
    }
    return await fetch(`${API_URL}/api/v1/table/${e_id}`, {
      headers: {
        Authorization: t,
      },
    }).then(async (r) => {
      if (!r.ok) {
        throw new_response_error(r);
      }
      return await r.json().then((data) => {
        if (data) {
          /**
           * @type {Map<BigInt, Table>}
           */
          const tables = new Map();
          for (const x of data) {
            tables.set(x.id, x);
          }
          return tables;
        }
        throw Error("No se encontraron las mesas");
      });
    });
  }

  async update_table_number(q, r_id, t) {
    if (!t) {
      throw ERROR_UNAUTHORIZED;
    }
    let qo = parseInt(q);
    if (!is_greater(r_id, ROLES.Waiter)) {
      throw Error("No tienes el rol necesario");
    }
    let url = `${API_URL}/api/v1/table/`;
    if (is_greater(r_id, ROLES.Waiter)) {
      url += this.id;
    }
    let method;
    if (q > this.quantity) {
      q = q - this.quantity;
      method = "POST";
    } else if (q < this.quantity) {
      q = this.quantity - q;
      method = "DELETE";
    } else {
      throw Error("Debes especificar una nueva cantidad de mesas");
    }
    url += `?q=${q}`;
    return await fetch(url, {
      headers: {
        Authorization: t,
      },
      method: method,
    }).then(async (r) => {
      if (!r.ok) {
        throw new_response_error(r);
      }
      return await r.json().then((data) => {
        if (method == "POST") {
          this.quantity = qo;
          return `Se agregaron ${q} mesas`;
        } else {
          this.quantity = this.quantity - data.deleted;
        }
        return `Se eliminaron ${data.deleted} mesas`;
      });
    });
  }
}
