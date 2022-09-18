import {
  API_URL,
  save_token,
  get_token,
  remove_token,
  new_response_error,
  ERROR_UNAUTHORIZED,
} from "./utils.js";
export const ROLES = {
  User: 0,
  Owner: 1,
  Admin: 2,
  Manager: 3,
  Waiter: 4,
};
const id_to_role = (id) => {
  switch (id) {
    case ROLES.User:
      return "Usuario";
    case ROLES.Owner:
      return "Dueño";
    case ROLES.Admin:
      return "Admin";
    case ROLES.Manager:
      return "Gerente";
    case ROLES.Waiter:
      return "Mesero";
  }
  return "NULO";
};
const API_URL_USER = `${API_URL}/api/v1/user/`;

export class Address {
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
  get is_deleted() {
    return this.data.is_deleted;
  }

  get stringer() {
    return `${this.street}, ${this.suburb}, ${this.city}, ${this.state}, ${this.country}, ${this.pc}`;
  }
}

/**
 * @typedef {Object} User
 */
export class User {
  constructor(data) {
    this.name = data["name"];
    this.url = data["url"];
    this.id = data["id"];
    this.email = data["email"];
    this.bdata = data["bdate"];
    this.is_verified = data["is_verified"];
    this.role_id = data["role_id"];
    this.est_id = data["est_id"];
    this.is_active = data["is_active"];
    this.data = data;
  }
  get role() {
    return id_to_role(this.role_id);
  }
  get status() {
    if (this.is_active) {
      return "Activo";
    }
    return "Inactivo";
  }
  async generate_verification_code() {
    let t = get_token();
    if (!t) {
      throw ERROR_UNAUTHORIZED;
    }
    if (this.is_verified) {
      throw Error("Usuario actualmente verificado");
    }
    await fetch(`${API_URL_USER}verify/`, {
      method: "POST",
      headers: { Authorization: t },
    }).then((r) => {
      if (!r.ok) {
        throw new_response_error(r);
      }
    });
  }

  async verify(code) {
    if (!code) {
      throw Error("Se necesita un codigo");
    }
    let t = get_token();
    if (!t) {
      throw ERROR_UNAUTHORIZED;
    }
    if (this.is_verified) {
      throw Error("Usuario actualmente verificado");
    }
    await fetch(`${API_URL_USER}verify/?code=${code}`, {
      method: "PATCH",
      headers: { Authorization: t },
    }).then((r) => {
      if (!r.ok) {
        throw new_response_error(r);
      }
    });
  }

  static async change_password(pwd) {
    if (!validate_password(pwd)) {
      throw Error("Contraseña invalida");
    }
    let t = get_token();
    if (!t) {
      throw ERROR_UNAUTHORIZED;
    }
    await fetch(`${API_URL_USER}password/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
        Authorization: t,
      },
      body: JSON.stringify({ password: pwd }),
    }).then((r) => {
      console.log(typeof r, r == "Response", r == Response, r.type);
      if (!r.ok) {
        throw new_response_error(r);
      }
    });
  }

  /**
   *
   * @returns {Promise<User>}
   */
  static async get_data() {
    return await get_user_data().then((data) => {
      return new User(data);
    });
  }

  static async signup(email, pwd) {
    await fetch(`${API_URL_USER}signup/`, {
      method: "POST",
      headers: { "Content-Type": "application/json;charset=utf-8" },
      body: JSON.stringify({ user: email, password: pwd }),
    }).then((r) => {
      if (!r.ok) {
        throw new_response_error(r);
      }
    });
  }

  async update() {
    let t = this.token;
    if (!t) {
      throw ERROR_UNAUTHORIZED;
    }
    await fetch(`${API_URL_USER}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
        Authorization: t,
      },
      body: this.data,
    }).then((r) => {
      if (!r.ok) {
        throw new_response_error(r);
      }
    });
  }

  get token() {
    return get_token();
  }

  /**
   * @returns {Promise<string>}
   */
  async add_delivery_address(data) {
    let t = this.token;
    if (!t) {
      throw ERROR_UNAUTHORIZED;
    }
    return await fetch(`${API_URL}/api/v1/address/delivery/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
        Authorization: t,
      },
      body: JSON.stringify(data),
    }).then(async (r) => {
      if (!r.ok) {
        throw new_response_error(r);
      } else {
        return await r.json().then((d) => {
          return d.id;
        });
      }
    });
  }

  /**
   *
   * @returns {Promise<Map<BigInt, Address>>}
   */
  async get_my_addresses() {
    let t = this.token;
    if (!t) {
      throw ERROR_UNAUTHORIZED;
    }
    return await fetch(`${API_URL}/api/v1/address/delivery/`, {
      headers: {
        "Content-Type": "application/json;charset=utf-8",
        Authorization: t,
      },
    }).then(async (r) => {
      if (!r.ok) {
        throw new_response_error(r);
      } else {
        return await r.json().then((ds) => {
          const adds = new Map();
          for (let d of ds) {
            adds.set(d.id, new Address(d));
          }
          return adds;
        });
      }
    });
  }
}

// Return a User class
export async function user() {
  let user;
  await get_user_data().then((data) => (user = data));
  return new User(user);
}

export async function refresh() {
  await fetch(`${API_URL_USER}refresh/`, {
    method: "POST",
    credentials: "include",
  }).then((r) => {
    if (r.ok) {
      r.json().then((data) => save_token(data["message"]));
    } else {
      throw new_response_error(r);
    }
  });
}

export async function signout() {
  remove_token();
  document.cookie = "";
  await fetch(`${API_URL_USER}refresh/`, { method: "DELETE" }).then((r) => {
    if (!r.ok) {
      throw new_response_error(r);
    }
  });
}

export async function login(user, pwd) {
  await fetch(`${API_URL_USER}signin/`, {
    method: "POST",
    headers: { "Content-Type": "application/json;charset=utf-8" },
    body: JSON.stringify({ user: user, password: pwd }),
  }).then(async (r) => {
    if (!r.ok) {
      throw new_response_error(r);
    }
    await r.json().then((data) => save_token(data["message"]));
  });
}

// Return a JSON object data
export async function get_user_data() {
  let token = get_token(); // Get Token From storage
  if (!token) {
    await refresh().then((token = get_token())); // Try to get Token from refresh cookie
    if (!token) {
      throw Error("usuario sin autentificar");
    }
  }
  let myHeaders = new Headers();
  myHeaders.append("Authorization", token);
  return await fetch(`${API_URL_USER}`, { headers: myHeaders }).then(
    async (r) => {
      if (!r.ok) {
        throw new_response_error(r);
      }
      return await r.json();
    }
  );
}

export function validate_email(email) {
  return /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i.test(
    email
  );
}

export function validate_password(password) {
  // return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!¡%*¿?/&\+\-\\#'.$($)$-$_])[A-Za-z\d$@$!¡%*¿?/&\+\-\\#'.$($)$-$_]{8,15}$/.test(
  //   pwd
  // );
  if (password.length >= 8) {
    var mayuscula = false;
    var minuscula = false;
    var numero = false;
    var caracter_raro = false;

    for (var i = 0; i < password.length; i++) {
      if (mayuscula && minuscula && numero && caracter_raro) {
        return true;
      }
      if (password.charCodeAt(i) >= 65 && password.charCodeAt(i) <= 90) {
        mayuscula = true;
      } else if (
        password.charCodeAt(i) >= 97 &&
        password.charCodeAt(i) <= 122
      ) {
        minuscula = true;
      } else if (password.charCodeAt(i) >= 48 && password.charCodeAt(i) <= 57) {
        numero = true;
      } else {
        caracter_raro = true;
      }
    }
    return mayuscula && minuscula && numero && caracter_raro;
  }
  return false;
}
