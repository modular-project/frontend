import { is_greater, ROLES, is_equal } from "./employee.js";
import { API_URL, new_response_error } from "./utils.js";

const API_URL_ORDER = `${API_URL}/api/v1/order/`;

const PAYMENTS = {
  CASH: 1,
  PAYPAL: 2,
};

export const STATUS = {
  WITHOUT_PAY: 1,
  PENDING: 2,
  COMPLETED: 3,
};

export class OrderProduct {
  constructor(data) {
    this.data = data;
  }

  get id() {
    return this.data.id;
  }
  get product_id() {
    return this.data.product_id;
  }
  get quantity() {
    return this.data.quantity;
  }
  get is_ready() {
    return this.data.is_ready;
  }
  get is_delivered() {
    return this.data.is_delivered;
  }
  set is_delivered(is) {
    this.data.is_delivered = is;
  }
  set is_ready(is) {
    this.data.is_ready = is;
  }
}
export class Search {
  /**
   *
   * @param {Map<string, any>} data
   */
  constructor(data, headers, limit, offset) {
    let order = [];
    let d, o, s, p;
    const filters = new Map();
    for (const h in headers) {
      if ((d = data.get(h))) {
        if ((s = d.search)) {
          filters.set(h, s);
        }
        if ((o = d.order)) {
          order.push({ by: headers[h], sort: parseInt(o) });
        }
      }
    }
    if ((p = filters.get("total"))) {
      filters.set("range", p.map(Number));
    }
    if ((p = filters.get("status"))) {
      if (p.length) {
        filters.set("status", p.map(Number));
      }
    }
    filters.set("default", { search_by: order, offset: offset, limit: limit });
    this.filters = filters;
  }
  get djson() {
    return JSON.stringify(Object.fromEntries(this.filters));
  }
}

const id_to_status = (id) => {
  switch (id) {
    case STATUS.WITHOUT_PAY:
      return "Sin Pagar";
    case STATUS.PENDING:
      return "Pendiente";
    case STATUS.COMPLETED:
      return "Completado";
  }
};

export class Order {
  constructor(data) {
    this.data = data;
    const products = new Map();
    if (data.products) {
      data.products.forEach(function (p, i) {
        products.set(p.id, new OrderProduct(p));
      });
    }
    /**
     * @type {Map<BigInt, OrderProduct}
     */
    this.products = products;
  }

  get id() {
    return this.data.ID;
  }
  get establishment_id() {
    return this.data.establishment_id;
  }
  get status_id() {
    return this.data.status;
  }
  get status() {
    return id_to_status(this.data.status);
  }
  get total() {
    return this.data.total;
  }
  get employee_id() {
    return this.data.employee_id;
  }
  get table_id() {
    return this.data.table_id;
  }
  get address_id() {
    return this.data.address_id;
  }
  get user_id() {
    return this.data.user_id;
  }
  get created_at() {
    let u = this.data.created_at;
    let d = new Date();
    d.setTime(parseInt(u) * 1000);
    // d.
    // return `${d.getDay()}/${d.getMonth()}/${d.getFullYear()} ${d.getHours()}:${d.getMinutes()}  ${d.toISOString()}`;
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
  }
  get type() {
    if (this.user_id) {
      return "A domicilio";
    }
    return "En establecimiento";
  }

  set total(t) {
    this.data.total = t;
  }
  /**
   *
   * @param {Search} s
   * @param {*} token
   * @param {*} u_rol
   * @returns
   */
  static async _search(s, t, url) {
    if (!t) {
      throw ERROR_UNAUTHORIZED;
    }
    const orders = new Map();
    await fetch(url, {
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
      console.log(r.headers.get("Content-Length"));
      if (r.headers.get("Content-Length")) {
        await r.json().then((data) => {
          for (let d of data) {
            orders.set(d["ID"], new Order(d));
          }
        });
      }
    });
    return orders;
  }

  /**
   *
   * @param {Search} s
   */
  static async search_establishment(s, e_id, t, u_rol) {
    if (!is_greater(u_rol, ROLES.Waiter)) {
      throw Error("No tienes el rol necesario");
    }
    let url = `${API_URL_ORDER}`;
    if (!is_greater(u_rol, ROLES.Manager)) {
      url = `${API_URL_ORDER}establishment/`;
    }
    s.filters.set("establishments", [parseInt(e_id)]);
    return await Order._search(s, t, url);
  }

  /**
   *
   * @param {Search} s
   */
  static async search(s, t, u_rol) {
    if (!is_greater(u_rol, ROLES.Manager)) {
      throw Error("No tienes el rol necesario");
    }
    let url = `${API_URL_ORDER}`;
    return await Order._search(s, t, url);
  }

  /**
   * @returns {Promise<Map<BigInt, Order>}
   */
  static async waiter(t, p = "") {
    if (!t) {
      throw ERROR_UNAUTHORIZED;
    }
    const orders = new Map();
    if (p) {
      p = "p/";
    }
    await fetch(`${API_URL_ORDER}waiter/${p}`, {
      headers: {
        Authorization: t,
      },
    }).then(async (r) => {
      if (!r.ok) {
        throw new_response_error(r);
      }
      console.log(r.headers.get("Content-Length"));
      if (r.headers.get("Content-Length") != "0") {
        await r.json().then((data) => {
          for (let d of data) {
            orders.set(d["ID"], new Order(d));
          }
        });
      }
    });
    return orders;
  }

  static async kitchen(t, last) {
    if (!t) {
      throw ERROR_UNAUTHORIZED;
    }
    const orders = new Map();
    last = parseInt(last);
    await fetch(`${API_URL_ORDER}kitchen/?last=${last}`, {
      headers: {
        Authorization: t,
      },
    }).then(async (r) => {
      if (!r.ok) {
        throw new_response_error(r);
      }
      if (r.headers.get("Content-Length") != "0") {
        await r.json().then((data) => {
          for (let d of data) {
            orders.set(d["id"], new OrderProduct(d));
            last = d["id"];
          }
        });
      }
    });
    return [orders, parseInt(last)];
  }

  static async complete_product(t, id) {
    if (!t) {
      throw ERROR_UNAUTHORIZED;
    }
    await fetch(`${API_URL_ORDER}product/${id}`, {
      headers: {
        Authorization: t,
      },
      method: "PATCH",
    }).then(async (r) => {
      if (!r.ok) {
        throw new_response_error(r);
      }
    });
  }

  static async deliver_products(t, ids) {
    if (!t) {
      throw ERROR_UNAUTHORIZED;
    }
    await fetch(`${API_URL_ORDER}product/deliver/`, {
      body: JSON.stringify(ids),
      headers: {
        Authorization: t,
        "Content-Type": "application/json;charset=utf-8",
      },
      method: "PATCH",
    }).then(async (r) => {
      if (!r.ok) {
        throw new_response_error(r);
      }
    });
  }

  /**
   *
   * @param {*} t
   * @param {Map<BigInt, BigInt>} products
   * @param {*} table
   */
  static async create_local_order(t, products, table) {
    let ps = [];
    if (!t) {
      throw ERROR_UNAUTHORIZED;
    }
    for (const [k, val] of products) {
      ps.push({ product_id: parseInt(k), quantity: parseInt(val) });
    }
    let body = { order_products: ps };
    return await fetch(`${API_URL_ORDER}local/${table}`, {
      body: JSON.stringify(body),
      method: "POST",
      headers: {
        Authorization: t,
        "Content-Type": "application/json;charset=utf-8",
      },
    }).then(async (r) => {
      if (!r.ok) {
        throw new_response_error(r);
      }
      return await r.json((data) => {
        return data;
      });
    });
  }

  /**
   *
   * @param {*} t
   * @param {Map<BigInt, BigInt>} products
   * @param {*} table
   */
  static async create_delivery_order(t, products) {
    let ps = [];
    if (!t) {
      throw ERROR_UNAUTHORIZED;
    }
    for (const [k, val] of products) {
      ps.push({ product_id: parseInt(k), quantity: parseInt(val) });
    }
    let body = { order_products: ps };
    return await fetch(`${API_URL_ORDER}delivery/`, {
      body: JSON.stringify(body),
      method: "POST",
      headers: {
        Authorization: t,
        "Content-Type": "application/json;charset=utf-8",
      },
    }).then(async (r) => {
      if (!r.ok) {
        throw new_response_error(r);
      }
      return await r.json((data) => {
        return data;
      });
    });
  }

  // ids[]
  static async add_products_to_order(t, products, o_id) {
    let ps = [];
    if (!t) {
      throw ERROR_UNAUTHORIZED;
    }
    for (const [k, val] of products) {
      ps.push({ product_id: parseInt(k), quantity: parseInt(val) });
    }
    return await fetch(`${API_URL_ORDER}local/add/${o_id}`, {
      body: JSON.stringify(ps),
      method: "POST",
      headers: {
        Authorization: t,
        "Content-Type": "application/json;charset=utf-8",
      },
    }).then(async (r) => {
      if (!r.ok) {
        throw new_response_error(r);
      }
      return await r.json((data) => {
        console.log(data);
        return data;
      });
    });
  }

  push_products(ps) {
    if (!ps) {
      return;
    }
    for (let p of ps) {
      this.products.set(p.id, new OrderProduct(p));
    }
  }

  static async pay_local_order(t, o_id) {
    if (!t) {
      throw ERROR_UNAUTHORIZED;
    }
    o_id = parseInt(o_id);
    return await fetch(`${API_URL_ORDER}local/pay/`, {
      body: JSON.stringify({
        orde_id: o_id,
        payment: PAYMENTS.CASH,
      }),
      method: "POST",
      headers: {
        Authorization: t,
        "Content-Type": "application/json;charset=utf-8",
      },
    }).then(async (r) => {
      if (!r.ok) {
        throw new_response_error(r);
      }
      return;
    });
  }
  //39J261311W877231J
  static async capture_payment(t, o_id) {
    if (!t) {
      throw ERROR_UNAUTHORIZED;
    }
    return await fetch(`${API_URL_ORDER}delivery/pay/${o_id}`, {
      method: "POST",
      headers: {
        Authorization: t,
      },
    }).then(async (r) => {
      if (!r.ok) {
        throw new_response_error(r);
      }
      return r.text().then((d) => {
        return d;
      });
    });
  }

  static async pay_delivery_order(t, o_id, add) {
    if (!t) {
      throw ERROR_UNAUTHORIZED;
    }
    o_id = parseInt(o_id);
    return await fetch(`${API_URL_ORDER}delivery/pay/`, {
      body: JSON.stringify({
        orde_id: o_id,
        payment: PAYMENTS.PAYPAL,
        address: add,
      }),
      method: "POST",
      headers: {
        Authorization: t,
        "Content-Type": "application/json;charset=utf-8",
      },
    }).then(async (r) => {
      if (!r.ok) {
        throw new_response_error(r);
      }
      return await r.json((data) => {
        console.log("Data: ", data);
        return data.id;
      });
    });
  }
  static async my_orders(t, s) {
    if (!t) {
      throw ERROR_UNAUTHORIZED;
    }
    let body;
    if (s) {
      body = JSON.stringify(s);
    }
    const orders = new Map();
    await fetch(`${API_URL_ORDER}user/`, {
      headers: {
        Authorization: t,
        "Content-Type": "application/json;charset=utf-8",
      },
      body: body,
      method: "POST",
    }).then(async (r) => {
      if (!r.ok) {
        throw new_response_error(r);
      }
      await r.json().then((data) => {
        for (let d of data) {
          orders.set(d["ID"], new Order(d));
        }
      });
    });
    return orders;
  }

  static async cancel_orders(t) {
    if (!t) {
      throw ERROR_UNAUTHORIZED;
    }
    const orders = new Map();
    await fetch(`${API_URL_ORDER}user/`, {
      headers: {
        Authorization: t,
      },
      method: "DELETE",
    }).then(async (r) => {
      if (!r.ok) {
        throw new_response_error(r);
      }
    });
  }
}
