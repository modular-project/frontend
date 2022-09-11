import { API_URL, get_token } from "./utils.js";

/**
 *
 * @returns {Promise<XMLHttpRequest.response>}
 */
export const upload_img = async (type, img, name) => {
  return new Promise((resolve, reject) => {
    let t = get_token();
    if (!t) {
      throw ERROR_UNAUTHORIZED;
    }
    let form_data = new FormData();
    form_data.append("img", img);
    form_data.append("name", name);

    let request = new XMLHttpRequest();
    request.onload = () => {
      if (request.status >= 200 && request.status < 300) {
        resolve(request.response);
      } else {
        throw Error("No se pudo subir la imagen al servidor");
      }
    };
    request.onerror = () => {
      throw Error("No se pudo subir la imagen al servidor");
    };
    request.responseType = "json";
    request.open("POST", `${API_URL}/api/v1/image/${type}/`);
    request.setRequestHeader("Authorization", t);
    request.send(form_data);
  });
};

export const upload_to_classify = async (img) => {
  return new Promise((resolve, reject) => {
    let t = get_token();
    if (!t) {
      throw ERROR_UNAUTHORIZED;
    }
    let form_data = new FormData();
    form_data.append("img", img);
    form_data.append("name", name);

    let request = new XMLHttpRequest();
    request.onload = () => {
      if (request.status >= 200 && request.status < 300) {
        resolve(request.response);
      } else {
        throw Error("No se pudo subir la imagen al servidor");
      }
    };
    request.onerror = () => {
      throw Error("No se pudo subir la imagen al servidor");
    };
    request.responseType = "json";
    request.open("POST", `${API_URL}/api/v1/classify/`);
    request.setRequestHeader("Authorization", t);
    request.send(form_data);
  });
};
