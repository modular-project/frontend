import { upload_img } from "./module/image.js";
import { User, validate_password } from "./module/user.js";
import { new_function } from "./module/utils.js";

/**
 * @type {User}
 */
let user;

let is_img_updated = false;

window.update_user = () => {
  new_function(async () => {
    // Obtener Datos
    let name = document.getElementById("name").value;
    let bdate = document.getElementById("bdate").value;
    if (bdate) {
      const date = new Date(bdate);
      bdate = date.toISOString();
    } else {
      bdate = null;
    }
    let url = user.url;
    // Conectar con el modulo o Hacer peticion
    if (is_img_updated) {
      let n = user.email;
      n = `${n}.png`;
      await upload_img(
        "user",
        document.getElementById("form-img").files[0],
        n
      ).then(
        (r) => (url = `https://drive.google.com/uc?export=view&id=${r.message}`)
      );
      is_img_updated = false;
      user.url = url;
    }
    let u = new User(JSON.stringify({ name: name, url: url, bdate: bdate }));
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
  document.getElementById("profile-pic").src = URL.createObjectURL(
    new_img.files[0]
  );
  is_img_updated = true;
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
      document.getElementById("profile-pic").src = user.url;
    } else {
      document.getElementById("profile-pic").src =
        "https://cdn-icons-png.flaticon.com/512/149/149071.png";
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
