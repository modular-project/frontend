import { Search, Order } from "./module/order.js";
import {
  clear_table,
  data_search_from_table,
  data_to_table,
  generate_body_from_array,
} from "./search.js";
import { Employee, Search as Empl_Search } from "./module/employee.js";
import { user as new_user } from "./module/user.js";
import { new_function } from "./module/utils.js";

/**
 * @type {Employee}
 */
let empl;

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
    await Order.search_establishment(s, 5, empl.user.token, empl.user.role_id)
      .then((r) => (data = r))
      .catch((err) => {
        clear_table(tname);
        throw err;
      });
    data_to_table(tname, data, headers);
  }, "Busqueda realizada con exito");
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
      .search_waiters(SO, 1)
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

const load_manager = async () => {
  let user;
  try {
    user = await new_user();
    empl = new Employee(user);
  } catch (error) {
    throw error;
  }
};

window.onload = () => {
  load_manager();
};
