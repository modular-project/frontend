import { Employee, is_greater } from "./module/employee.js";
import { upload_img } from "./module/image.js";
import { load_nav_bar } from "./module/main.js";
import { Order } from "./module/order.js";
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

let was_waiter = false;

/**
 * @type {Date}
 */
let prev_q;
/**
 * @type {Date}
 */
let prev_q_end;
/**
 * @type {Date}
 */
let current_q;
/**
 * @type {Date}
 */
let current_q_end;

window.update_user = () => {
  const form = document.getElementById("formADP");
  new_function(async () => {
    // Obtener Datos
    let name = document.getElementById("name").value;
    let bdate = document.getElementById("bdate").value;
    let nss = document.getElementById("nss").value;
    let rfc = document.getElementById("rfc").value;
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
    let u = new User(
      JSON.stringify({ name: name, url: url, bdate: bdate, rfc: rfc, nss: nss })
    );
    if (!empl) {
      await u.update();
    } else {
      await empl.update_by_user_id(user.id, u.data);
    }
  }, "Información actualizada con exito");
};

window.change_password = () => {
  const form = document.getElementById("chpdw");
  new_function(async () => {
    let pwd = document.getElementById("ch_pwd").value;
    await User.change_password(pwd);
    form.reset();
  }, "Contraseña actualizada");
};

window.generate_verification_code = () => {
  const form = document.getElementById("formGCV");
  new_function(async () => {
    await user.generate_verification_code();
    form.reset();
  }, "El código de verificación fue enviado con éxito a su correo");
};

window.verify = () => {
  new_function(async () => {
    let code = document.getElementById("verify_code").value;
    await user.verify(code);
    window.location.reload();
  }, "Usuario verificado satisfactoriamente");
};

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
      await User.get_data().then((d) => (empl = new Employee(d)));
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
      await User.get_data().then((d) => (user = d));
      const e = new Employee(user);
      try {
        await e.get_my_jobs().then((r) => {
          jobs = r;
        });
      } catch (error) {
        console.error(error);
      }
    }
    if (user.name) {
      document.getElementById("name").value = user.name;
    }
    if (user.rfc) {
      document.getElementById("rfc").value = user.rfc;
    }
    if (user.nss) {
      document.getElementById("nss").value = user.nss;
    }
    console.log(user);
    if (user.bdata) {
      console.log(user.bdata.substring(0, 10));
      document.getElementById("bdate").value = user.bdata.substring(0, 10);
    }
    document.getElementById("read-email").placeholder = user.email;

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
    const reason = document.getElementById("reason-fire").value;
    await empl.fire(user.id, reason);
    window.location.reload();
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
    if (ob.role_id == ROLES.Waiter) {
      was_waiter = true;
    }
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
    template.getElementById("reasont").textContent = `Razon: ${ob.reason}`;
    if (ob.is_active) {
      is = "Activo";
      template.getElementById("upat").textContent = "";
      template.getElementById("reasont").textContent = "";
    }
    template.getElementById("isact").textContent = `Estado: ${is}`;
    template.getElementById(
      "sal"
    ).textContent = `Salario Quincenal: $${ob.salary}`;

    const clone = template.cloneNode(true);
    fragment.appendChild(clone);
  }

  hist.appendChild(fragment);
  if (was_waiter) {
    show_tips();
  }
};

/**
 *
 * @param {Date} d
 * @returns
 */
const format_d = (d, add = 0) => {
  return `${d.getFullYear()}-${(d.getMonth() + 1).toLocaleString("en-US", {
    minimumIntegerDigits: 2,
    useGrouping: false,
  })}-${(add + d.getDate()).toLocaleString("en-US", {
    minimumIntegerDigits: 2,
    useGrouping: false,
  })}`;
};

window.getTips = async (c) => {
  new_function(async () => {
    let target = "";
    if (empl) {
      target = user.id;
    }
    let start;
    let end;
    switch (c) {
      case "0":
        let s = document.getElementById("date-start");
        let e = document.getElementById("date-end");
        if (!s.value) {
          throw Error("Ingresa una fecha de inicio");
        }
        if (!e.value) {
          throw Error("Ingresa una fecha de fin");
        }
        let sd = new Date(s.value);
        let ed = new Date(e.value);
        if (ed <= sd) {
          throw Error("Debes ingresar una fecha de fin mayor a la de inicio");
        }
        start = format_d(sd, 1);
        end = format_d(ed, 1);
        break;
      case "1":
        start = format_d(current_q);
        end = format_d(current_q_end);
        break;
      case "2":
        start = format_d(prev_q);
        end = format_d(prev_q_end);
        break;
      default:
        break;
    }
    await Order.tips_by_waiter(user.token, start, end, target)
      .then((r) => (document.getElementById("tips-holder").value = r.tips))
      .catch((err) => {
        console.error(err);
        document.getElementById("tips-holder").value = 0;
      });
  }, "Busqueda realizada con exito");
};

const show_tips = () => {
  console.log("was");
  let doc = document.getElementById("my-tips");
  doc.hidden = false;
  let current = document.getElementById("current-q");
  let prev = document.getElementById("prev-q");
  let d = new Date();
  if (d.getDate() < 16) {
    current.textContent = `${d.getMonth() + 1}/01/${d.getFullYear()} - 
    ${d.getMonth() + 1}/16/${d.getFullYear()}`;

    current_q = new Date(`${d.getMonth() + 1}-01-${d.getFullYear()}`);
    current_q_end = new Date(`${d.getMonth() + 1}-16-${d.getFullYear()}`);

    prev.textContent = `${d.getMonth()}/16/${d.getFullYear()} - 
    ${d.getMonth() + 1}/01/${d.getFullYear()}`;

    prev_q = new Date(`${d.getMonth()}-16-${d.getFullYear()}`);
    prev_q_end = new Date(`${d.getMonth() + 1}-01-${d.getFullYear()}`);
  } else {
    current.textContent = `${d.getMonth() + 1}/16/${d.getFullYear()} - 
    ${d.getMonth() + 2}/01/${d.getFullYear()}`;

    current_q = new Date(`${d.getMonth() + 1}-16-${d.getFullYear()}`);
    current_q_end = new Date(`${d.getMonth() + 2}-01-${d.getFullYear()}`);

    prev.textContent = `${d.getMonth() + 1}/01/${d.getFullYear()} - 
    ${d.getMonth() + 1}/16/${d.getFullYear()}`;

    prev_q = new Date(`${d.getMonth() + 1}-01-${d.getFullYear()}`);
    prev_q_end = new Date(`${d.getMonth() + 1}-16-${d.getFullYear()}`);
  }
  console.log(current_q, current_q_end, prev_q, prev_q_end);
};

window.onload = async function () {
  await load_user_data();
  load_nav_bar();
  historial();
};
