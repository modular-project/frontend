import { API_URL } from "./utils.js";

const API_URL_KITCHEN = `${API_URL}/api/v1/kitchen/`;

export class Kitchen {
  constructor(data) {
    this.data = data;
  }
  static async create_account(uname, pwd) {
    await fetch(`${API_URL_KITCHEN}signup/`, {
      method: "POST",
      headers: { "Content-Type": "application/json;charset=utf-8" },
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
}
