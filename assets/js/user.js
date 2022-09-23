import { Employee, is_greater } from "./module/employee.js";
import { upload_img } from "./module/image.js";
import { load_nav_bar } from "./module/main.js";
import { ROLES, User, validate_password } from "./module/user.js";
import { new_function } from "./module/utils.js";

/**
 * @type {User}
 */
let user;

/**
 * @type {Employee}
 */
let empl;

let is_img_updated = false;

let jobs = new Map();

window.update_user = () => {
  const form = document.getElementById("formADP");
  new_function(async () => {
    // Obtener Datos
    let name = document.getElementById("name").value;
    let bdate = document.getElementById("bdate").value;
    if (bdate) {
      const date = new Date(bdate);
      date.setHours(36);
      bdate = date.toISOString();
    } else {
      bdate = null;
    }
    let url = user.url;
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
    if (!empl) {
      await u.update();
    } else {
      await empl.update_by_user_id(user.id, u.data);
    }
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
<<<<<<< HEAD
  }, "Usuario verificado satisfactoriamente"); 
}
=======
    window.location.reload();
  }, "Usuario verificado satisfactoriamente");
>>>>>>> f5630d51e175a4447bc8d9994704921fd0dcce91

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
    const params = new Proxy(new URLSearchParams(window.location.search), {
      get: (searchParams, prop) => searchParams.get(prop),
    });
    const uid = params.uid;
    if (uid) {
      await User.get_data().then((d) => (empl = new Employee(new User(d))));
      if (empl.user.id != uid) {
        document.getElementById("ch-pass-sec").remove();
        document.getElementById("ch-pwd-li").remove();
        await empl.get_user_data_by_id(uid).then((d) => {
          user = d.user;
          jobs = d.jobs;
          console.log(user);
        });
        if (is_greater(empl.user.role_id, user.role_id)) {
          document.getElementById("fire-sec").hidden = false;
        } else {
          document.getElementById("fire-li").remove();
        }
      } else {
        user = empl.user;
        document.getElementById("fire-li").remove();
        await empl.get_my_jobs((r) => (jobs = r));
      }
    } else {
      document.getElementById("fire-li").remove();
      await User.get_data().then((d) => (user = new User(d)));
      const e = new Employee(user);
      await e.get_my_jobs().then((r) => {
        jobs = r;
      });
    }
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
      document.getElementById("generate-li").remove();
      document.getElementById("verify-li").remove();
    }
  } catch (error) {
    console.log(error);
  }
};

window.fire = () => {
  new_function(async () => {
    await empl.fire(user.id);
  }, "Usuario despedido con exito");
};

window.historial = () => {
  const hist = document.querySelector("#hist");
  const template = document.querySelector("#trabajos").content;
  const fragment = document.createDocumentFragment();

  for (const [num, ob] of jobs) {
    console.log(ob);
    template.getElementById("crat").textContent = `Contratado el: ${new Date(
      ob.created_at
    ).toLocaleString()}`;

    template.getElementById("roleid").textContent = `Rol: ${ob.role}`;
    if (ob.establishment_id) {
      template.getElementById(
        "estid"
      ).textContent = `ID establecimiento: ${ob.establishment_id}`;
    } else {
      template.getElementById("estid").textContent = "";
    }
    let is = "Inactivo";
    template.getElementById("upat").textContent = `Despedido el: ${new Date(
      ob.updated_at
    ).toLocaleString()}`;
    if (ob.is_active) {
      is = "Activo";
      template.getElementById("upat").textContent = "";
    }
    template.getElementById("isact").textContent = `Estado: ${is}`;
    template.getElementById("sal").textContent = `Salario: $${ob.salary}`;

    const clone = template.cloneNode(true);
    fragment.appendChild(clone);
  }

  hist.appendChild(fragment);
};

window.onload = async function () {
  await load_user_data();
  load_nav_bar();
  historial();
};
