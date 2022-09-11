//export const API_URL = `https://e5a924a0-82cc-4cae-a959-8c29cceba390.mock.pstmn.io`;
export const API_URL = `https://1dd73a05-8cfb-4895-990e-62e85d715702.mock.pstmn.io`; //hilario
// export const API_URL = `http://127.0.0.1:4001`;

export const ERROR_UNAUTHORIZED = Error("Usuario sin autentificar");

let alert_count = 0;

const ERR_RESPONSE = "response";

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

const create_alert = (id, type, msg, strong) => {
  return `<div id="alert-${id}" class="my-alert alert ${type} alert-dismissible">
      <a href="#" onclick='close_alert(${id}); return false;' id="ch-alert-close" class="close"
        aria-label="close">&times;</a>
      <strong>${strong}</strong> ${msg}
    </div>`;
};

const remove_alert = (id) => {
  document.getElementById(`alert-${id}`).remove();
};

/**
 *
 * @param {function} func
 * @param {string} msg
 * @param {null | function} onCreate
 */
export async function new_function(
  func,
  msg = "Operación Completada",
  onCreate = null
) {
  try {
    await func();
    add_alert_ok(msg);
    if (onCreate) {
      await onCreate();
    }
  } catch (err) {
    handler_errors(err);
  }
}

export const add_alert = (type, msg, strong) => {
  alert_count += 1;
  const count = alert_count;
  if (!strong) {
    strong = "";
  }
  document.getElementById("ch-alert").innerHTML += create_alert(
    count,
    type,
    msg,
    strong
  );
  setTimeout(() => {
    remove_alert(count);
  }, 5000);
  $(".my-alert").fadeOut(5000);
  //fade_out($(".my-alert"));
  // $(`#alert-${count}`).fadeOut(5000);
};

export const add_alert_ok = (msg) => {
  add_alert("alert-success", msg);
};

export function handler_errors(err) {
  switch (err.name) {
    case ERR_RESPONSE:
      /**
       * @type {Response}
       */
      let r = err.r;
      const s = r.status;
      let msg;
      r.json().then((d) => (msg = d.messsage));
      if (!msg) {
        msg = "No se pudo realizar la operación";
      }
      add_alert("alert-danger", msg, `Error ${s}!`);
      break;
    case "Error":
      add_alert("alert-danger", err.message);
      break;
    default:
      console.log(err);
      break;
  }
}

export const new_response_error = (r) => {
  return { name: ERR_RESPONSE, r: r };
};
