import {
  get_deletes,
  get_product_delete,
  load_menu,
  product_by_id,
} from "./product.js";
import { new_function } from "./module/utils.js";
import { upload_img, upload_to_classify } from "./module/image.js";
import { Product, BASES } from "./module/product.js";
import {
  data_search_from_table,
  data_to_table,
  clear_table,
  generate_body_from_array,
} from "./search.js";
import { Employee, Search, ROLES } from "./module/employee.js";
import { User, user as new_user, validate_email } from "./module/user.js";
import { Search as Order_Search, Order } from "./module/order.js";
import {
  Search as Estb_Search,
  Establishment,
} from "./module/establishment.js";
import { load_nav_bar } from "./module/main.js";

/**
 * @type {Employee}
 */
let empl;

let n_img = false;

/**
 * @type {Map<BigInt, Order>}
 */
let lastest_orders;

const classify_img = async () => {
  return await upload_to_classify(
    document.getElementById("create-img").files[0]
  ).then((r) => {
    return r.id;
  });
};

window.change_prod_pic = async () => {
  let new_img = document.getElementById("create-img");
  document.getElementById("create-product-pic").src = URL.createObjectURL(
    new_img.files[0]
  );

  const b_id = await classify_img();
  const base = BASES[parseInt(b_id)];
  let name = document.getElementById("nombre");
  if (!name.value) {
    name.value = base;
  }
  let base_id_doc = document.getElementById("create-base");
  if (base_id_doc.value == "null") {
    base_id_doc.value = `${b_id}`;
  }
};

window.change_prod_pic_u = () => {
  let new_img = document.getElementById("create-img-u");
  document.getElementById("create-product-pic-u").src = URL.createObjectURL(
    new_img.files[0]
  );
  n_img = true;
};

window.showProduct = (pid) => {
  /**
   * @type {Product}
   */
  const p = product_by_id(parseInt(pid));
  n_img = false;
  document.getElementById("nombre-u").value = p.name;
  document.getElementById("precio-u").value = p.price;
  document.getElementById("desc-u").value = p.description;
  document.getElementById("create-base-u").value = p.base;
  document.getElementById("product-id-u").value = p.id;
  if (p.url) {
    document.getElementById("create-product-pic-u").src = p.url;
  } else {
    document.getElementById("create-product-pic-u").src =
      "https://i.pinimg.com/originals/fd/80/ec/fd80ecec48eba2a9adb76e4133905879.png";
  }
};

window.createProduct = () => {
  const form = document.getElementById("formCreateP");
  new_function(async () => {
    let nombre = document.getElementById("nombre").value;
    let precio = document.getElementById("precio").value;
    let descripcion = document.getElementById("desc").value;
    let base = document.getElementById("create-base").value;
    let f = document.getElementById("create-img").files[0];
    console.log(base);
    if (base == "null") {
      throw Error("Selecciona un producto base");
    }
    let url = "";
    if (!f) {
      throw Error("Ingresa una imagen");
    }
    if (!nombre) {
      throw Error("Ingresa un nombre para el producto");
    }
    if (!precio) {
      throw Error("Ingresa un precio para el producto");
    }
    if (!descripcion) {
      throw Error("Ingresa una descripción para el producto");
    }
    await upload_img(
      "product",
      document.getElementById("create-img").files[0],
      `${nombre}.png`
    ).then(
      (r) => (url = `https://drive.google.com/uc?export=view&id=${r.message}`)
    );
    let p = new Product({
      name: nombre,
      price: parseFloat(precio),
      description: descripcion,
      base_id: parseInt(base),
      url: url,
    });
    await p.save().then((id) => {
      console.log("TODO: Show Product to menu", id);
    });
    form.reset();
    document.getElementById("create-product-pic-u").src =
      "https://i.pinimg.com/originals/fd/80/ec/fd80ecec48eba2a9adb76e4133905879.png";
  }, "Producto creado con exito");
};

window.deleteProduct = () => {
  const form = document.getElementById("formUpdateP");
  new_function(async () => {
    let old_id = document.getElementById("product-id-u").value;
    await Product.delete_by_id(old_id).then(() => {
      console.log("TODO: Remove Product from menu", old_id);
    });
    form.reset();
    document.getElementById("create-product-pic-u").src =
      "https://i.pinimg.com/originals/fd/80/ec/fd80ecec48eba2a9adb76e4133905879.png";
  }, "Producto Eliminado con exito");
};

window.updateProduct = () => {
  const form = document.getElementById("formUpdateP");
  new_function(async () => {
    let nombre = document.getElementById("nombre-u").value;
    let precio = document.getElementById("precio-u").value;
    let descripcion = document.getElementById("desc-u").value;
    let base = document.getElementById("create-base-u").value;
    let f = document.getElementById("create-img-u").files[0];
    let old_id = document.getElementById("product-id-u").value;
    console.log(base);
    if (base == "null" || base == "") {
      throw Error("Selecciona un producto base");
    }
    let url = "";

    if (!nombre) {
      throw Error("Ingresa un nombre para el producto");
    }
    if (!precio) {
      throw Error("Ingresa un precio para el producto");
    }
    if (!descripcion) {
      throw Error("Ingresa una descripción para el producto");
    }
    if (n_img) {
      if (!f) {
        throw Error("Ingresa una imagen");
      }
      await upload_img(
        "product",
        document.getElementById("create-img-u").files[0],
        `${nombre}.png`
      ).then(
        (r) => (url = `https://drive.google.com/uc?export=view&id=${r.message}`)
      );
    } else {
      const p = product_by_id(parseInt(old_id));
      url = p.url;
    }
    let p = new Product({
      id: parseInt(old_id),
      name: nombre,
      price: parseFloat(precio),
      description: descripcion,
      base_id: parseInt(base),
      url: url,
    });
    await p.update_by_id(parseInt(old_id)).then((id) => {
      console.log("TODO: Show Product to menu", id);
    });
    form.reset();
  }, "Producto Actualizado con exito");
};

const load_bases = () => {
  const f = document.getElementById("create-base");
  const u = document.getElementById("create-base-u");
  BASES.forEach((val, i) => {
    var opt = document.createElement("option");
    opt.value = i;
    opt.innerHTML = val;
    var opt2 = document.createElement("option");
    opt2.value = i;
    opt2.innerHTML = val;
    u.appendChild(opt);
    f.appendChild(opt2);
  });
};

const load_admin = async () => {
  load_menu("showProduct", "update-modal");
  load_bases();
  let user;
  try {
    user = await new_user();
    empl = new Employee(user);
    if (empl.user.role_id == ROLES.Admin) {
      document.getElementById("hire-ad-sec").remove();
      document.getElementById("hire-ad-li").remove();
    }
    load_nav_bar();
  } catch (error) {
    throw error;
  }
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

    const SO = new Search(
      0,
      0,
      o,
      s,
      search.get("status").search,
      search.get("role").search
    );
    console.log(SO);
    let user_search;
    await empl
      .search(SO)
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
      headers,
      "select_employee"
    );
  }, "Busqueda completada con exito");
};

window.select_employee = (id) => {
  window.open(`user.html?uid=${id}`);
};

window.search_order = () => {
  new_function(async () => {
    const tname = "t-s-order";
    const filters = data_search_from_table(tname);
    const headers = {
      total: 1,
      status: 3,
      created_at: 0,
    };

    const s = new Order_Search(filters, headers);
    await Order.search(s, empl.user.token, empl.user.role_id)
      .then((r) => (lastest_orders = r))
      .catch((err) => {
        clear_table(tname);
        throw Error("Sin resultados");
      });
    data_to_table(
      tname,
      lastest_orders,
      headers,
      "show_products_from_order",
      `data-toggle="modal" data-target="#pay-order-modal"`
    );
  }, "Busqueda realizada con exito");
};

/**
 *
 * @param {Order} order
 */
const showOrder = async (order) => {
  let list = document.getElementById("modal-list");
  list.innerHTML = "";
  // let total = 0;
  let not = [];
  for (const [pID, q] of order.products) {
    const p = product_by_id(q.product_id);
    if (!p) {
      not.push(q.product_id);
    }
  }
  if (not.length) {
    await get_deletes(not);
  }
  for (const [pID, q] of order.products) {
    let p = product_by_id(q.product_id);
    if (!p) {
      p = get_product_delete(q.product_id);
    }
    // total += p.price * q;
    list.innerHTML += `
    <li class="list-group-item">
      ${p.name} - $${p.price} x ${q.quantity} = $${parseFloat(
      p.price * q.quantity
    ).toFixed(2)}
    </li>`;
  }
  list.innerHTML += `
  <li class="list-group-item">
    Total: <b>$${parseFloat(order.total).toFixed(2)}</b>
  </li>`;
};

window.show_products_from_order = async (o_id) => {
  console.log("mostrando: ", o_id);
  await Order.get_by_id(empl.user.token, empl.user.role_id, o_id).then(
    async (ops) => {
      let order = lastest_orders.get(parseInt(o_id));
      order.products = ops;
      await showOrder(order);
      console.log(order);
    }
  );
};

window.search_establishments = () => {
  new_function(async () => {
    const headers = {
      street: 1,
      suburb: 2,
      city: 3,
      state: 4,
      country: 5,
      pc: 6,
    };
    const tname = "t-s-establishment";
    const filters = data_search_from_table(tname);
    console.log(filters);
    const s = new Estb_Search(filters, headers, 0, 0);
    console.log(s);
    await Establishment.search(s, empl.user.role_id, empl.user.token)
      .then((r) => {
        data_to_table(tname, r, headers, "select_establishment");
      })
      .catch((err) => {
        clear_table(tname);
        console.error(err);
        throw Error("Sin resultados");
      });
  });
};

window.select_establishment = (id) => {
  window.open(`manager.html?aid=${id}`);
};

window.createEstablishment = async () => {
  let calle = document.getElementById("calleCE").value;
  let numero = document.getElementById("numCE").value;
  let colonia = document.getElementById("colCE").value;
  let ciudad = document.getElementById("ciudadCE").value;
  let codigoPostal = document.getElementById("cpCE").value;
  let estado = document.getElementById("estadoCE").value;
  let pais = document.getElementById("paisCE").value;
  const form = document.getElementById("formCreateE");

  if (!calle) {
    throw Error("Ingresa una calle para el establecimiento");
  }
  if (!numero) {
    throw Error("Ingresa un numero para el establecimiento");
  }
  if (!colonia) {
    throw Error("Ingresa una colonia para el establecimiento");
  }
  if (!ciudad) {
    throw Error("Ingresa una ciudad para el establecimiento");
  }
  if (!codigoPostal) {
    throw Error("Ingresa un código postal para el establecimiento");
  }
  if (!estado) {
    throw Error("Ingresa un estado para el establecimiento");
  }
  if (!pais) {
    throw Error("Ingresa un pais para el establecimiento");
  }
  const e = new Establishment({
    line1: `${calle} ${numero}`,
    line2: colonia,
    city: ciudad,
    pc: codigoPostal,
    state: estado,
    country: pais,
  });
  await e.save(empl.user.token, empl.user.role_id).then((r) => console.log(r));
  form.reset();
};

window.hireAdmin = () => {
  const form = document.getElementById("formHireA");
  new_function(async () => {
    let email = document.getElementById("emailCA").value;
    let salario = document.getElementById("salarioCA").value;

    if (!email) {
      throw Error("Ingresa un correo electrónico para el administrador");
    }
    if (!validate_email(email)) {
      throw Error("Ingresa un correo electrónico válido");
    }
    if (!salario) {
      throw Error("Ingresa un salario para el administrador");
    }
    await empl.hire(email, ROLES.Admin, parseFloat(salario));
    form.reset();
  }, "Usuario contratado con exito");
};

window.onload = function () {
  load_admin();
};
