import { API_URL } from "./utils.js";

const API_URL_ESTB = `${API_URL}establishment/`;

class Establishment {
  constructor(data) {
    this.data = data;
  }

  get id() {
    return this.data["id"];
  }
  get streat() {}
}
