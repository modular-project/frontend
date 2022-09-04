// export const API_URL = `https://e5a924a0-82cc-4cae-a959-8c29cceba390.mock.pstmn.io`;
export const API_URL = `http://127.0.0.1:4001`;

export const ERROR_UNAUTHORIZED = Error("Usuario sin autentificar");

export function save_token(token) {
  window.localStorage.setItem("token", `Bearer ${token}`);
}

export function get_token() {
  return window.localStorage.getItem("token");
}

export function remove_token() {
  window.localStorage.removeItem("token");
}

export function get_authorization() {
  let t = get_token();
  if (!t) {
    return;
  }
  return "Authorization", token;
}

export function handler_errors(err) {}
