import { User, validate_password } from "./module/user.js";
import { new_function } from "./module/utils.js";

/**
 * @type {User}
 */
let user;

window.update_user = () => {
  new_function(async () => {
    // Obtener Datos
    let name = document.getElementById("name").value;
    let url = document.getElementById("url").value;
    let bdate = document.getElementById("bdate").value;
    const date = new Date(bdate);
    // Conectar con el modulo o Hacer peticion
    let u = new User(
      JSON.stringify({ name: name, url: url, bdate: date.toISOString() })
    );
    // Aqui conectamos antes con el modulo y luego hacemos peticion
    // Depente de la funcion a utilizar
    await u.update();
  }, "Información actualizada con exito");
};

window.change_password = () =>
  new_function(async () => {
    let pwd = document.getElementById("ch_pwd").value;
    await User.change_password(pwd);
  }, "Contraseña actualizada");

window.generate_verification_code = () =>
  new_function(async () => {
    await user.generate_verification_code();
  }, "El código de verificación fue enviado con éxito a su correo");

window.verify = () =>
  new_function(async () => {
    let code = document.getElementById("verify_code").value;
    await user.verify(code);
  }, "Usuario verificado satisfactoriamente");

window.enable_ch_btn = function enable_ch_btn() {
  let pwd = document.getElementById("ch_pwd").value;
  let pwd_btn = document.getElementById("ch_pwd_btn");
  console.log(pwd);
  if (validate_password(pwd)) {
    pwd_btn.disabled = false;
  } else {
    pwd_btn.disabled = true;
  }
};

window.change_prof_pic = () => {
  let new_img = document.getElementById("form-img");
  let old = document.getElementById("profile-pic");
  old.src = URL.createObjectURL(new_img.target.files[0]);
};

const load_user_data = async () => {
  try {
    await User.get_data().then((d) => (user = d));
    console.log(user);
    if (user.name) {
      document.getElementById("name").value = user.name;
    }
    if (user.bdata) {
      document.getElementById("bdate").value = user.bdata.substring(0, 10);
    }
    if (user.url) {
      document.getElementById("url").value = user.url;
    }
    if (user.is_verified) {
      document.getElementById("gen_ver_code_form").hidden = true;
      document.getElementById("ver_user_form").hidden = true;
    }
  } catch (error) {
    console.log(error);
  }
};

window.onload = function () {
  load_user_data();
};
