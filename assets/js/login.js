import * as user_module from "./module/user.js";
import { handler_errors, new_function } from "./module/utils.js";
  
const login = () => {
  const form = document.getElementById("formLogin");
  new_function(async () => {
    let user = document.getElementById("email").value;
    let pwd = document.getElementById("password").value;
    await user_module.login(user, pwd);
    window.location.href = `${window.location.origin}/index.html`;
    form.reset();
  });
};

window.login = login;

window.signup = async () => {
  const form = document.getElementById("formLogin");
  new_function(async () => {
    let pass = document.getElementById("password").value;
    let email = document.getElementById("email").value;
    await user_module.User.signup(email, pass);
    login();
    form.reset();
  }, "Usuario creado con exito, Intenta iniciar sesion");
};

window.enable_btn = function enable_btn() {
  let loginbtn = document.getElementById("loginbtn");
  let signupbtn = document.getElementById("signupbtn");
  let pass = document.getElementById("password").value;
  let email = document.getElementById("email").value;
  if (
    user_module.validate_email(email) &&
    user_module.validate_password(pass)
  ) {
    loginbtn.disabled = false;
    signupbtn.disabled = false;
  } else {
    loginbtn.disabled = true;
    signupbtn.disabled = true;
  }
};
