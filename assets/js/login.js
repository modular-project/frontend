import * as user_module from "./module/user.js";
import { handler_errors } from "./module/utils.js";

window.login = async function login() {
  let user = document.getElementById("email").value;
  let pwd = document.getElementById("password").value;
  const form = document.getElementById("formLogin");
  try {
    await user_module.login(user, pwd);
    window.location.href = `${window.location.origin}/index.html`;
  } catch (err) {
    handler_errors(err);
  }
  form.reset();
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
