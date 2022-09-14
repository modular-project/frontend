import { is_greater, ROLES, is_equal } from "./employee.js";
import { API_URL, new_response_error } from "./utils.js";

const API_URL_ORDER = `${API_URL}/api/v1/order/`;

const STATUS = {
  WITHOUT_PAY: 1,
  PENDING: 2,
  COMPLETED: 3,
};

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
    filters.set("default", { order_by: order, offset: offset, limit: limit });
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
  }

  get id() {
    return this.data.id;
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
  get products() {
    return this.data.products;
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
    let d = new Date(u * 1000);
    return `${d.getDay()}/${d.getMonth()}/${d.getFullYear()} ${d.getHours()}:${d.getMinutes()}`;
  }
  get type() {
    if (this.user_id) {
      return "A domicilio";
    }
    return "En establecimiento";
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
      await r.json().then((data) => {
        for (let d of data) {
          orders.set(d["ID"], new Order(d));
        }
      });
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
      url = `${API_URL_ORDER}/establishment/`;
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
}
