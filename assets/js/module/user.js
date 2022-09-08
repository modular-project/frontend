import {
  API_URL,
  save_token,
  get_token,
  remove_token,
  new_response_error,
  ERROR_UNAUTHORIZED,
} from "./utils.js";

const API_URL_USER = `${API_URL}/api/v1/user/`;

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
    this.data = data;
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
  }).then((r) => {
    if (!r.ok) {
      throw new_response_error(r);
    }
    r.json().then((data) => save_token(data["message"]));
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
  return await fetch(`${API_URL_USER}`, { headers: myHeaders }).then((r) => {
    if (!r.ok) {
      throw new_response_error(r);
    }
    return r.json();
  });
}

export function validate_email(email) {
  return /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i.test(
    email
  );
}

export function validate_password(pwd) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!¡%*¿?/&\+\-\\#'.$($)$-$_])[A-Za-z\d$@$!¡%*¿?/&\+\-\\#'.$($)$-$_]{8,15}$/.test(
    pwd
  );
}
