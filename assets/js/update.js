import { User, validate_password } from "./module/user.js";
import { new_function } from "./module/utils.js";

//$("#ch-alert-close").click(() => $("#ch-alert").hide("fade"));

// let alert_count = 0;

// window.close_alert = (id) => $(`#alert-${id}`).remove();

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
  });
};
// function update_user() {
//   let name = document.getElementById("name").value;
//   let url = document.getElementById("url").value;
//   let bdate = document.getElementById("bdate").value;

//   const date = new Date(bdate);
//   let u = new User(
//     JSON.stringify({ name: name, url: url, bdate: date.toISOString() })
//   );
//   u.update();
// };

// const create_alert = (id, type, msg) => {
//   return `<div id="alert-${id}" class="my-alert alert ${type} alert-dismissible">
//       <a href="#" onclick='close_alert(${id}); return false;' id="ch-alert-close" class="close"
//         aria-label="close">&times;</a>
//       <strong>Success!</strong> ${msg}
//     </div>`;
// };

// const remove_alert = (id) => {
//   document.getElementById(`alert-${id}`).remove();
// };

// const add = (type, msg) => {
//   alert_count += 1;
//   let count = alert_count;
//   document.getElementById("ch-alert").innerHTML += create_alert(
//     count,
//     type,
//     msg
//   );
//   setTimeout(() => {
//     remove_alert(count);
//   }, 5000);
//   $(".my-alert").fadeOut(5001);
//   //fade_out($(".my-alert"));
//   // $(`#alert-${count}`).fadeOut(5000);
// };

//METODO 1

window.change_password = () =>
  new_function(async () => {
    let pwd = document.getElementById("ch_pwd").value;
    await User.change_password(pwd);
  }, "Contraseña actualizada"
);

// METODO 2

// window.change_password = async function change_password() {
//   new_function(async () => {
//     let pwd = document.getElementById("ch_pwd").value;
//     await User.change_password(pwd);
//   }, "Contraseña actualizada");
// };

// METODO 3: TRADICIONAL

// window.change_password = async function change_password() {
//   try {

//     // $(`#ch-alert`).show("fade");
//     add("alert-success", "Contraseña actualizada");
//   } catch (err) {
//     handler_errors(err);
//   }
// };

window.generate_verification_code = () =>
  new_function(async () => {
    await User.generate_verification_code();
  }, "El código de verificación fue enviado con éxito a su correo"
);

window.verify = () =>
  new_function(async () => {
    let code = document.getElementById("verify_code").value;
    await User.verify(code);
  }, "Usuario verificado satisfactoriamente"
);

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

const load_user_data = async () => {
  try {
    let u = User;
    await User.get_data().then((d) => (u = d));
    console.log(u);
    if (u.name) {
      document.getElementById("name").value = u.name;
    }
    if (u.bdata) {
      document.getElementById("bdate").value = u.bdata.substring(0, 10);
    }
    if (u.url) {
      document.getElementById("url").value = u.url;
    }
  } catch (error) {
    console.log(error);
  }
};

window.onload = function () {
  load_user_data();
};
