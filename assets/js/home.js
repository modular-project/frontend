import * as user_module from "./module/user.js";
import { handler_errors } from "./module/utils.js";

// Exportar funciones para usar en HTML
window.signout = function () {
  user_module.signout().finally(window.location.reload());
};

/**
 * @param  {boolean} is_logged
 */
function switch_log_button(is_logged) {
  let btn = document.getElementById("login-button");
  if (!is_logged) {
    btn.innerHTML = `<a href="login.html">Login</a>`;
  } else {
    btn.innerHTML = `<a href="" onclick="signout(); return false">Cerrar Sesion</a>`;
  }
}

/**
 *
 * @param {user_module.User} user
 */
function example_user(user) {
  console.log(user.email, user.role_id);
}

async function load_home() {
  let user;
  let is_logged = false;
  try {
    user = await user_module.user();
    is_logged = true;
    console.log("usuario logeado");
  } catch (err) {
    console.error(err);
    console.log("usuario NO logeado");
  }
  try {
    switch_log_button(is_logged); // Hacer funciones que tomen como parametro al usuario o el estado is_logged
  } catch (err) {
    handler_errors(err);
  }
}

window.onload = function () {
  load_home();
};
