import { upload_img } from "./module/image.js";
import { User, validate_password } from "./module/user.js";
import { new_function } from "./module/utils.js";

/**
 * @type {User}
 */
let user;

let is_img_updated = false;

const h = {
  jobs: new Map([
    [
      1,
      {
        id: 1,
        c_at: "2022-07-06T22:17:09.818892-05:00",
        u_at: "2022-07-06T22:17:09.818892-05:00",
        user_id: 4,
        role_id: 1,
        est_id: 3,
        is_active: true,
        salary: 200
      }
    ],
    [
      2,
      {
        id: 2,
        c_at: "2022-07-06T22:17:09.818892-05:00",
        u_at: "2022-07-06T22:17:09.818892-05:00",
        user_id: 2,
        role_id: 1,
        est_id: 2,
        is_active: true,
        salary: 400
      }
    ],
    [
      3,
      {
        id: 3,
        c_at: "2022-07-06T22:17:09.818892-05:00",
        u_at: "2022-07-06T22:17:09.818892-05:00",
        user_id: 3,
        role_id: 1,
        est_id: 4,
        is_active: true,
        salary: 300
      }
    ],
    [
      4,
      {
        id: 4,
        c_at: "2022-07-06T22:17:09.818892-05:00",
        u_at: "2022-07-06T22:17:09.818892-05:00",
        user_id: 1,
        role_id: 1,
        est_id: 1,
        is_active: true,
        salary: 150
      }
    ]
  ])
};

window.update_user = () => {
  const form = document.getElementById("formADP");
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
    form.reset();
  }, "Información actualizada con exito");
};

window.change_password = () => {
  const form = document.getElementById("chpdw");
  new_function(async () => {
    let pwd = document.getElementById("ch_pwd").value;
    await User.change_password(pwd);
    form.reset();
  }, "Contraseña actualizada");
}

window.generate_verification_code = () => {
  const form = document.getElementById("formGCV");
  new_function(async () => {
    await user.generate_verification_code();
    form.reset();
  }, "El código de verificación fue enviado con éxito a su correo");
}

window.verify = () => {
  new_function(async () => {
    let code = document.getElementById("verify_code").value;
    await user.verify(code);
  }, "Usuario verificado satisfactoriamente"); 
}

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

window.historial = () => {
  const hist = document.querySelector('#hist');
  const template = document.querySelector("#trabajos").content;
  const fragment = document.createDocumentFragment();

  for (const [num, ob] of h.jobs) {
    // template.querySelector("h5 #aidi").textContent = ob.id;
    // template.querySelector("h5 #crat").textContent = ob.c_at;
    // template.querySelector("h5 #upat").textContent = ob.u_at;
    // template.querySelector("h5 #userid").textContent = ob.user_id;
    // template.querySelector("h5 #roleid").textContent = ob.role_id;
    // template.querySelector("h5 #estid").textContent = ob.est_id;
    // template.querySelector("h5 #isact").textContent = ob.is_active;
    // template.querySelector("h5 #sal").textContent = ob.salary;

    template.getElementById("crat").textContent = `Creado el: ${ob.c_at}`; 
    template.getElementById("upat").textContent = `Actualizado el: ${ob.u_at}`; 
    template.getElementById("roleid").textContent = `Rol: ${ob.role_id}`; 
    template.getElementById("estid").textContent = `ID establecimiento: ${ob.est_id}`; 
    template.getElementById("isact").textContent = `Está activo: ${ob.is_active}`; 
    template.getElementById("sal").textContent = `Salario: ${ob.salary}`; 

    const clone = template.cloneNode(true);
    fragment.appendChild(clone);
  }

  hist.appendChild(fragment);
}

window.onload = function () {
  load_user_data();
  historial();
};
