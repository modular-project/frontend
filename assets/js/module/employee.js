import { User } from "./user.js";
import { new_response_error, API_URL, get_token } from "./utils.js";

const API_URL_EMPLOYEE = `${API_URL}/api/v1/employee/`;

export const ROLES = {
  User: 0,
  Owner: 1,
  Admin: 2,
  Manager: 3,
  Waiter: 4,
};

export const STATUS = {
  Active: 0,
  Inactive: 1,
  Any: 2,
};

export const SORT_BY = {
  ASC: 0,
  Des: 1,
};

export const ORDER_BY = {
  Name: 0,
  Email: 1,
  Role: 2,
  Establishment: 3,
};

export class Search {
  /**
   *
   * @param {number} offset
   * @param {number} limit
   * @param {number[] | null} order
   * @param {number[] | null} status
   * @param {number[] | null} roles
   * @param {number[] | null} ests
   */
  constructor(
    offset = 0,
    limit = 10,
    order = null,
    status = 0,
    roles = null,
    ests = null
  ) {
    this.data = {
      order: order,
      limit: limit,
      status: status,
      roles: roles,
      ests: ests,
      offset: offset,
    };
  }
}

const is_greater = (origin, target) => {
  if (origin == target) {
    return false;
  }
  return origin < target && (origin != ROLES.User || target == ROLES.User);
};

const is_equal = (origin, target) => {
  if (!origin) {
    return false;
  }
  return origin == target;
};
// "id": 3,
//             "c_at": "2022-07-07T09:28:45.947176-05:00",
//             "u_at": "2022-07-07T09:28:45.947176-05:00",
//             "user_id": 1,
//             "role_id": 2,
//             "est_id": 0,
//             "is_active": true,
//             "salary": 70

export class Job {
  constructor(props) {
    this.data = props;
  }

  get id() {
    return this.data["id"];
  }

  get created_at() {
    return this.data["c_at"];
  }

  get updated_at() {
    return this.data["u_at"];
  }

  get user_id() {
    return this.data["user_id"];
  }

  get role_id() {
    return this.data["role_id"];
  }

  get establishment_id() {
    return this.data["est_id"];
  }

  get is_active() {
    return this.data["is_active"];
  }

  get salary() {
    return this.data["salary"];
  }
}

export class Employee {
  /**
   *
   * @param {User} user
   */
  constructor(user) {
    /**
     * @type {User}
     */
    this.user = user;
  }

  get role() {
    return this.user.role_id;
  }

  get establishment() {
    return this.user.est_id;
  }

  async update_by_user_id(uid, user) {
    if (!id) {
      throw Error("Se necesita especificar un usuario");
    }
    if (!user) {
      throw Error("Se necesitan los datos a actualizar");
    }
    if (!is_greater(this.role, ROLES.Waiter)) {
      throw Error("No tienes el rol necesario");
    }
    let t = get_token();
    if (!t) {
      throw ERROR_UNAUTHORIZED;
    }
    await fetch(`${API_URL_EMPLOYEE}${uid}`, {
      body: user,
      headers: {
        "Content-Type": "application/json;charset=utf-8",
        Authorization: t,
      },
      method: "PUT",
    }).then((r) => {
      if (!r.ok) {
        throw new_response_error(r);
      }
    });
  }

  async fire(uid) {
    if (!id) {
      throw Error("Se necesita especificar un usuario a despedir");
    }
    if (!is_greater(this.role, ROLES.Waiter)) {
      throw Error("No tienes el rol necesario");
    }
    let t = get_token();
    if (!t) {
      throw ERROR_UNAUTHORIZED;
    }
    await fetch(`${API_URL_EMPLOYEE}fire/${uid}`, {
      headers: {
        Authorization: t,
      },
      method: "PATCH",
    }).then((r) => {
      if (!r.ok) {
        throw new_response_error(r);
      }
    });
  }

  async hire(email, role, salary, est) {
    if (!email) {
      throw Error("Se necesita especificar un email");
    }
    if (!role) {
      throw Error("Se necesita especificar un rol");
    }
    if (!salary) {
      throw Error("Se necesita especificar un salario");
    }
    if (!is_greater(this.role, ROLES.Manager)) {
      throw Error("No tienes el rol necesario");
    }
    if (!is_greater(role, Manager) && !est) {
      throw Error("Se necesita especificar un establecimiento para este rol");
    }
    let t = get_token();
    if (!t) {
      throw ERROR_UNAUTHORIZED;
    }
    await fetch(`${API_URL_EMPLOYEE}hire/${email}`, {
      body: JSON.stringify({ role_id: role, est_id: est, salary: salary }),
      headers: {
        "Content-Type": "application/json;charset=utf-8",
        Authorization: t,
      },
      method: "POST",
    }).then((r) => {
      if (!r.ok) {
        throw new_response_error(r);
      }
    });
  }

  async hire_waiter(email, salary) {
    if (!email) {
      throw Error("Se necesita especificar un email");
    }
    if (!salary) {
      throw Error("Se necesita especificar un salario");
    }
    if (!is_equal(this.role, ROLES.Manager)) {
      throw Error("No tienes el rol necesario");
    }
    let t = get_token();
    if (!t) {
      throw ERROR_UNAUTHORIZED;
    }
    await fetch(`${API_URL_EMPLOYEE}hire/waiter/${email}`, {
      body: JSON.stringify({
        role_id: ROLES.Waiter,
        salary: salary,
      }),
      headers: {
        "Content-Type": "application/json;charset=utf-8",
        Authorization: t,
      },
      method: "POST",
    }).then((r) => {
      if (!r.ok) {
        throw new_response_error(r);
      }
    });
  }
  /**
   *
   * @param {*} uid
   * @returns {Promise<{user: typeof User;jobs: Map<BigInt, Job>;}>}
   */
  async get_user_data_by_id(uid) {
    if (!uid) {
      throw Error("Se necesita especificar un ID de usuario");
    }
    if (!is_greater(this.role, ROLES.Waiter)) {
      throw Error("No tienes el rol necesario");
    }
    let t = get_token();
    if (!t) {
      throw ERROR_UNAUTHORIZED;
    }
    let u = User;
    let jobs = new Map();
    await fetch(`${API_URL_EMPLOYEE}${uid}`, {
      headers: {
        Authorization: t,
      },
    }).then(async (r) => {
      if (!r.ok) {
        throw new_response_error(r);
      }
      await r.json().then((data) => {
        u = new User(data["user"]);
        for (let d of data) {
          jobs.set(d["id"], new Job(d));
        }
      });
    });

    return { user: u, jobs: jobs };
  }

  /**
   * @returns {Promise<Map<BigInt, Job>>}
   */
  async get_my_jobs() {
    let t = get_token();
    if (!t) {
      throw ERROR_UNAUTHORIZED;
    }
    let jobs = new Map();
    await fetch(`${API_URL_EMPLOYEE}`, {
      headers: {
        Authorization: t,
      },
    }).then(async (r) => {
      if (!r.ok) {
        throw new_response_error(r);
      }
      await r.json().then((data) => {
        for (let d of data["jobs"]) {
          jobs.set(d["id"], new Job(d));
        }
      });
    });
    return jobs;
  }

  /**
   *
   * @param {Search} s
   * @returns {Promise<Map<number, User>>}
   */
  async search(s) {
    let t = get_token();
    if (!t) {
      throw ERROR_UNAUTHORIZED;
    }
    if (!is_greater(this.role, ROLES.Manager)) {
      throw Error("No tienes el rol necesario");
    }
    let users = new Map();
    await fetch(`${API_URL_EMPLOYEE}search/`, {
      body: JSON.stringify(s.data),
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
          users.set(d["id"], new User(d));
        }
      });
    });
    return users;
  }

  /**
   *
   * @param {Search} s
   * @returns {Promise<Map<number, User>>}
   */
  async search_waiters(s) {
    let t = get_token();
    if (!t) {
      throw ERROR_UNAUTHORIZED;
    }
    if (!is_equal(this.role, ROLES.Manager)) {
      throw Error("No tienes el rol necesario");
    }
    let users = new Map();
    await fetch(`${API_URL_EMPLOYEE}search/waiter/`, {
      body: JSON.stringify(s.data),
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
          users.set(d["id"], new User(d));
        }
      });
    });
    return users;
  }
}
