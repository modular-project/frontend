import {
  get_token,
  save_token,
  remove_token,
  API_URL,
  new_response_error,
} from "./utils.js";

const API_URL_KITCHEN = `${API_URL}/api/v1/kitchen/`;

export class Kitchen {
  constructor(data) {
    this.data = data;
  }

  get user() {
    return this.data.user;
  }

  static token() {
    return get_token();
  }

  static signout() {
    remove_token();
  }

  static async create_account(t, uname, pwd) {
    if (!t) {
      throw ERROR_UNAUTHORIZED;
    }
    await fetch(`${API_URL_KITCHEN}signup/`, {
      method: "POST",
      headers: {
        Authorization: t,
        "Content-Type": "application/json;charset=utf-8",
      },
      body: JSON.stringify({ user: uname, password: pwd }),
    }).then((r) => {
      if (!r.ok) {
        throw new_response_error(r);
      }
    });
  }

  static async login(user, pwd) {
    await fetch(`${API_URL_KITCHEN}signin/`, {
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

  static is_login() {
    return get_token();
  }

  static async get_kitchens(t) {
    if (!t) {
      throw ERROR_UNAUTHORIZED;
    }
    return await fetch(`${API_URL_KITCHEN}`, {
      headers: {
        Authorization: t,
      },
    }).then(async (r) => {
      let kits = new Map();
      if (!r.ok) {
        throw new_response_error(r);
      }
      if (r.headers.get("Content-Length") != "0") {
        await r.json().then((data) => {
          for (let d of data) {
            kits.set(d.id, new Kitchen(d));
          }
        });
      }
      console.log("Kits: ", kits);
      return kits;
    });
  }

  static async delete_by_id(t, id) {
    if (!t) {
      throw ERROR_UNAUTHORIZED;
    }
    return await fetch(`${API_URL_KITCHEN}${id}`, {
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

  // Return a JSON object data
  //   static async get_data() {
  //   let token = get_token(); // Get Token From storage
  //   if (!token) {
  //     await refresh().then((token = get_token())); // Try to get Token from refresh cookie
  //     if (!token) {
  //       throw Error("cocina sin autentificar");
  //     }
  //   }
  //   let myHeaders = new Headers();
  //   myHeaders.append("Authorization", token);
  //   return await fetch(`${API_URL_KITCHEN}`, { headers: myHeaders }).then(
  //     async (r) => {
  //       if (!r.ok) {
  //         throw new_response_error(r);
  //       }
  //       return await r.json().then(d => {return d});
  //     }
  //   );
  // }
}
