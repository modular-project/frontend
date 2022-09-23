import { Search, Order } from "./module/order.js";
import {
  clear_table,
  data_search_from_table,
  data_to_table,
  generate_body_from_array,
} from "./search.js";
import { Employee, Search as Empl_Search } from "./module/employee.js";
import {
  ROLES,
  user as new_user,
  validate_email,
  validate_password,
} from "./module/user.js";
import { new_function } from "./module/utils.js";
import { Establishment } from "./module/establishment.js";
import { Kitchen } from "./module/kitchen.js";
import { load_nav_bar } from "./module/main.js";

/**
 * @type {Employee}
 */
let empl;
let estb_id = 0;
let add_id = "";
/**
 * @type {Establishment}
 */
let _estb;
let quantity_tables = 0;

/**
 * @type {Map<BigInt, Kitchen>}
 */
let k = new Map();

// const k = new Map([
//   [
//     1,
//     {
//       user: "cuenta1",
//     },
//   ],
//   [
//     2,
//     {
//       user: "cuenta2",
//     },
//   ],
//   [
//     3,
//     {
//       user: "cuenta3",
//     },
//   ],
//   [
//     4,
//     {
//       user: "cuenta4",
//     },
//   ],
//   [
//     5,
//     {
//       user: "cuenta5",
//     },
//   ],
// ]);

window.search_order = () => {
  new_function(async () => {
    const tname = "t-s-order";
    const filters = data_search_from_table(tname);
    const headers = {
      total: 1,
      status: 3,
      created_at: 0,
    };

    console.log(filters);
    const s = new Search(filters, headers);
    let data;
    await Order.search_establishment(
      s,
      estb_id,
      empl.user.token,
      empl.user.role_id
    )
      .then((r) => (data = r))
      .catch((err) => {
        clear_table(tname);
        throw err;
      });
    data_to_table(tname, data, headers);
  }, "Busqueda realizada con exito");
};

const key_to_int = (key) => {
  switch (key) {
    case "name":
      return 0;
    case "email":
      return 1;
    case "role":
      return 2;
    case "status":
      return 3;
  }
};

window.search_employees = async () => {
  new_function(async () => {
    const headers = {
      name: "Nombre",
      email: "Correo",
      role: "Rol",
      status: "Estado",
    };
    const search = data_search_from_table("t-s-user");
    let o = [];
    for (const [key, val] of search) {
      if (val.order != "0") {
        let so;
        if (val.order > 0) {
          so = 0;
        } else {
          so = 1;
        }
        o.push({ by: key_to_int(key), sort: so });
      }
    }
    let s = "";
    const name = search.get("name").search;
    if (name) {
      s += `users.name LIKE '%${name}%'`;
    }
    const email = search.get("email").search;
    if (email) {
      if (s) {
        s += ` AND `;
      }
      s += `users.email LIKE '%${email}%'`;
    }

    const SO = new Empl_Search(
      0,
      10,
      o,
      s,
      search.get("status").search,
      search.get("role").search
    );
    let user_search;
    await empl
      .search_waiters(SO, estb_id)
      .then((r) => {
        user_search = r;
        console.log(user_search);
      })
      .catch((err) => {
        document.querySelector("#t-s-user").querySelector("tbody").innerHTML =
          "";
        throw err;
      });
    const t = document.querySelector("#t-s-user");
    t.querySelector("tbody").innerHTML = generate_body_from_array(
      user_search,
      headers
    );
  }, "Busqueda completada con exito");
};

window.updateNumTables = async () => {
  let msg = "Operacion completada";
  const form = document.getElementById("formACM");
  new_function(async () => {
    let cantidadMesas = document.getElementById("mesasACM").value;
    if (!cantidadMesas) {
      throw Error("Ingresa una cantidad de mesas para el establecimiento");
    }
    await _estb
      .update_table_number(cantidadMesas, empl.user.role_id, empl.user.token)
      .then((r) => {
        document.getElementById("mesasACM").value = _estb.quantity;
        msg = r;
      });
    console.log(msg);
    form.reset();
  }, msg);
};

window.hireManagerCook = () => {
  const form = document.getElementById("formCGM");
  new_function(async () => {
    let email = document.getElementById("emailCGM").value;
    let salario = document.getElementById("salarioCGM").value;
    let role = document.getElementById("select-role").value;
    if (!email) {
      throw Error("Ingresa un correo electrónico para el administrador");
    }
    if (!validate_email(email)) {
      throw Error("Ingresa un correo electrónico válido");
    }
    if (!salario) {
      throw Error("Ingresa un salario para el administrador");
    }
    if (empl.user.role_id == ROLES.Manager) {
      await empl.hire_waiter(email, salary);
    } else {
      await empl.hire(email, role, salario, _estb.id);
    }
    form.reset();
  }, "Usuario contratado");
};

window.createCookAccount = () => {
  const form = document.getElementById("formCCC");
  new_function(async () => {
    let uname = document.getElementById("unameCCC").value;
    let password = document.getElementById("passCCC").value;
    if (!uname) {
      throw Error("Ingresa un nombre de usuario");
    }
    if (uname.length < 5) {
      throw Error("El nombre de usuario debe tener al menos 5 caracteres");
    }
    if (!password) {
      throw Error("Ingresa una contraseña");
    }
    if (!validate_password(password)) {
      throw Error("Ingresa una contraseña válida");
    }
    await Kitchen.create_account(empl.user.token, uname, password);
    form.reset();
  }, "Cuenta de cocina creada con exito");
};

// LOAD MANAGER
const load_manager = async () => {
  let user;
  try {
    user = await new_user();
    empl = new Employee(user);
    if (empl.user.role_id == ROLES.Manager) {
      document.getElementById("div-select-role").hidden = true;
    }
    if (empl.user.est_id) {
      estb_id = empl.user.est_id;
    } else {
      const params = new Proxy(new URLSearchParams(window.location.search), {
        get: (searchParams, prop) => searchParams.get(prop),
      });
      add_id = params.aid;
      if (add_id) {
        await Establishment.get_by_address(add_id, empl.user.token).then(
          (data) => {
            estb_id = data.id;
            window.history.replaceState(
              {},
              document.title,
              "/" + `manager.html?eid=${estb_id}`
            );
          }
        );
      } else {
        estb_id = params.eid;
      }
    }
    if (!estb_id) {
      window.location.href = "index.html";
    }
    if (user.role_id == ROLES.Admin) {
      document.getElementById("create-kitchen-sec").remove();
      document.getElementById("show-kitchen-sec").remove();
      document.getElementById("create-kitchen-li").remove();
      document.getElementById("show-kitchen-li").remove();
    }
    load_nav_bar();
    await Establishment.get_by_id(estb_id, empl.user.token).then(
      (d) => (_estb = d)
    );
    document.getElementById("dirACM").value = _estb.stringer;
    document.getElementById("mesasACM").value = _estb.quantity;
  } catch (error) {
    throw error;
  }
};

window.modalFunction = () => {
  console.log(`El modal funciona correctamente :)`);
};

window.kitchenAccounts = async () => {
  const kitchen = document.querySelector("#kitchenAc");
  const template = document.querySelector("#kitchenUsers").content;
  const fragment = document.createDocumentFragment();

  await Kitchen.get_kitchens(empl.user.token).then((r) => (k = r));
  console.log(k);
  for (const [num, ob] of k) {
    template.querySelector(".element").id = `element-k-${num}`;
    template.getElementById("userk").textContent = `Usuario: ${ob.user}`;
    template.querySelector(".mostrar-datos button").id = num;
    template
      .querySelector(".mostrar-datos button")
      .setAttribute("onclick", `delete_kitchen(${num});return false;`);

    const clone = template.cloneNode(true);
    fragment.appendChild(clone);
  }

  kitchen.appendChild(fragment);
};

window.delete_kitchen = (id) => {
  new_function(async () => {
    await Kitchen.delete_by_id(empl.user.token, id);
    document.getElementById(`element-k-${id}`).remove();
  });
};

window.modalFunction = () => {
  console.log(`El modal funciona correctamente :)`);
};

window.onload = async () => {
  await load_manager();
  kitchenAccounts();
};
