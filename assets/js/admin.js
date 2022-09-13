import { load_menu } from "./product.js";
import { new_function } from "./module/utils.js";
import { upload_img } from "./module/image.js";
import { Product, BASES } from "./module/product.js";
import { data_search_from_table, generate_body_from_data } from "./search.js";
import { Employee, Search } from "./module/employee.js";
import { User, user as new_user, validate_email } from "./module/user.js";

/**
 * @type {Employee}
 */
let empl;

window.change_prod_pic = () => {
  let new_img = document.getElementById("create-img");
  document.getElementById("create-product-pic").src = URL.createObjectURL(
    new_img.files[0]
  );
};

window.createProduct = () => {
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
    // await upload_img(
    //   "product",
    //   document.getElementById("create-img").files[0],
    //   `${nombre}.png`
    // ).then(
    //   (r) => (url = `https://drive.google.com/uc?export=view&id=${r.message}`)
    // );
    let p = new Product({
      name: nombre,
      price: precio,
      description: descripcion,
      base: base,
      url: url,
    });
    await p.save().then((id) => {
      console.log("TODO: Show Product to menu", id);
    });
  }, "Producto creado con exito");
};

const load_bases = () => {
  const f = document.getElementById("create-base");
  BASES.forEach((val, i) => {
    var opt = document.createElement("option");
    opt.value = i;
    opt.innerHTML = val;
    f.appendChild(opt);
  });
};

const load_admin = async () => {
  load_menu();
  load_bases();
  let user;
  try {
    user = await new_user();
    empl = new Employee(user);
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
      10,
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
        console.log("Catch: ", err);
        throw err;
      });
    const t = document.querySelector("#t-s-user");
    t.querySelector("tbody").innerHTML = generate_body_from_data(
      user_search,
      headers
    );
  }, "Busqueda completada con exito");
};

window.createEstablishment = () => {
  let calle = document.getElementById("calleCE").value;
  let numero = document.getElementById("numCE").value;
  let colonia = document.getElementById("colCE").value;
  let ciudad = document.getElementById("ciudadCE").value;
  let codigoPostal = document.getElementById("cpCE").value;
  let estado = document.getElementById("estadoCE").value;
  let pais = document.getElementById("paisCE").value;

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
  } else {
    console.log(
      `${calle} ${numero} ${colonia} ${ciudad} ${codigoPostal} ${estado} ${pais}`
    );
  }
};

window.hireAdmin = () => {
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
  } else {
    console.log(`${email} ${salario}`);
  }
};

window.onload = function () {
  //search_employees();
  load_admin();
  // const h = {
  //   name: "Nombre",
  //   price: "Precio",
  //   address: "Direccion",
  //   greater: "saludo",
  //   age: "edad",
  //   date: "fecha",
  // };
  // const m = new Map([
  //   [
  //     1,
  //     {
  //       name: "Nicolas",
  //       price: 123.34,
  //       no1: "No mostrar this 1",
  //       address: "Hotel",
  //       greater: "Golang",
  //       no2: "No mostrar this 1",
  //       age: 14,
  //       date: "1312321",
  //     },
  //   ],
  //   [
  //     2,
  //     {
  //       no1: "No mostrar this 1",
  //       name: "Nicolas 2",
  //       price: 123.342,
  //       address: "Hotel 2",
  //       no2: "No mostrar this 1",
  //       greater: "Golang 2",
  //       age: 142,
  //       date: "1312321 2",
  //     },
  //   ],
  // ]);
  // document.getElementById("test-table").innerHTML += generate_header(h);
  // const t = document.querySelector("#test-table");
  // t.querySelector("tbody").innerHTML = generate_body_from_data(m, h);
};
