import * as user_module from "./module/user.js";
import { handler_errors, new_function } from "./module/utils.js";
import {
  get_deletes,
  get_product_delete,
  load_menu,
  product_by_id,
} from "./product.js";
import { Order, OrderProduct, STATUS } from "./module/order.js";
import { load_nav_bar } from "./module/main.js";

/**
 * @type {Map<BigInt, BigInt>}
 */
let my_cart = new Map();

/**
 * @type {user_module.User}
 */
let user;

/**
 * @type {Map<BigInt, user_module.Address}
 */
let my_address = new Map();
/**
 * @type {Map<BigInt, Order}
 */
let my_orders = new Map();

let deletes = [];

let count = 0;

// Exportar funciones para usar en HTML
window.signout = function () {
  user_module.signout().finally(window.location.reload());
};

const find_deletes = async () => {
  let havePending = false;
  for (const [k, val] of my_orders) {
    if (val.status_id == STATUS.WITHOUT_PAY) {
      my_orders.delete(k);
      havePending = true;
    } else {
      for (const [kp, p] of val.products)
        if (!product_by_id(p.product_id)) {
          deletes.push(parseInt(p.product_id));
        }
    }
  }
  if (deletes.length) {
    await get_deletes(deletes);
  }
  if (havePending) {
    await Order.cancel_orders(user.token);
  }
};

/**
 * @param  {boolean} is_logged
 */
function switch_log_button(is_logged) {
  let btn = document.getElementById("login-button");
  if (!is_logged) {
    btn.innerHTML = `<a href="login.html">Login</a>`;
    document.getElementById("my-orders").remove();
    document.getElementById("my-orders-btn").remove();
    document.getElementById("make-order-btn").remove();
    document.getElementById("my-cart-li").remove();
    document.getElementById("my-addresses").remove();
    document.getElementById("my-address-li").remove();
    document.getElementById("my-cart").remove();
  } else {
    btn.innerHTML = `<a href="" onclick="signout(); return false">Cerrar Sesion</a>`;
    btn.classList = "";
    if (!user.is_verified) {
      document.getElementById("make-order-btn").remove();
    } else {
      document.getElementById("verify-account-btn").remove();
    }
    if (user.role_id) {
      const rli = document.getElementById("my-role-li");
      rli.hidden = false;
      switch (user.role_id) {
        case user_module.ROLES.Owner:
          rli.innerHTML = `<a href="admin.html">Dueño</a>`;
          break;
        case user_module.ROLES.Admin:
          rli.innerHTML = `<a href="admin.html">Admin</a>`;
          break;
        case user_module.ROLES.Manager:
          rli.innerHTML = `<a href="manager.html">Gerente</a>`;
          break;
        case user_module.ROLES.Waiter:
          rli.innerHTML = `<a href="waiter.html">Mesero</a>`;
          break;
      }
    }
  }
}

window.add_address = () => {
  new_function(async () => {
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
    }
    const e = new user_module.Address({
      line1: `${calle} ${numero}`,
      line2: colonia,
      city: ciudad,
      pc: codigoPostal,
      state: estado,
      country: pais,
    });
    await e.save(user.token).then((r) => {
      console.log(r.id);
      e.id = r.id;
      my_address.set(r, e);
      load_address();
    });
    window.location.reload();
  });
};

function show_user_data_button(is_logged) {
  let btn = document.getElementById("user-data-button");
  if (is_logged) {
    btn.innerHTML = `<a href="user.html">Mis Datos</a>`;
  }
}

window.add_item = (id) => {
  id = parseInt(id);
  const p = product_by_id(id);
  if (!my_cart.has(id)) {
    add_product_to_cart(p);
  }
};

async function load_home() {
  let is_logged = false;
  try {
    user = await user_module.user();
    is_logged = true;
    console.log("usuario logeado");
    const params = new Proxy(new URLSearchParams(window.location.search), {
      get: (searchParams, prop) => searchParams.get(prop),
    });
    console.log(params.token);
    const token = params.token;
    if (token) {
      await Order.capture_payment(user.token, token);
      window.history.replaceState({}, document.title, "/" + "index.html");
    }
  } catch (err) {
    console.error(err);
    console.log("usuario NO logeado");
  }
  try {
    switch_log_button(is_logged); // Hacer funciones que tomen como parametro al usuario o el estado is_logged
    show_user_data_button(is_logged);
    load_nav_bar();
    if (is_logged) {
      await load_menu("add_item");
      await user.get_my_addresses().then((r) => {
        my_address = r;
      });
      load_address();
      load_my_orders().catch((e) => {
        console.error(e);
      });
    } else {
      load_menu();
    }
  } catch (err) {
    handler_errors(err);
  }
}

// add product to order
/**
 *
 * @param {Product} p
 */
function add_product_to_cart(p) {
  my_cart.set(p.id, 1);
  document.getElementById("my-cart-row").innerHTML += `
<div class="col-sm-3  text-center" id="cart-item-${p.id}">
<div class="card h-100">
  <img class="card-img-top h-50" 
      src="${p.url}"
      alt="${p.name}">
  <div class="card-body">
      <h5 class="card-title">${p.name}</h5>
      <div class="input-group mb-3">
          <div class="input-group-prepend">
              <span class="input-group-text" id="cart-a-${p.id}">Cantidad</span>
          </div>
          <input type="number" min="0" class="cart-item-${p.id} form-control check-amount"
              aria-describedby="cart-a-${p.id}" value="1">
      </div>
  </div>
</div>
</div>`;
  $(".check-amount").on("input", function () {
    if ($(this).val() < 1) {
      document.getElementById(this.classList[0]).remove();
      my_cart.delete(parseInt(this.classList[0].slice(10)));
    } else {
      document
        .getElementById(this.classList[0])
        .getElementsByTagName("input")[0]
        .setAttribute("value", `${$(this).val()}`);
      my_cart.set(
        parseInt(this.classList[0].slice(10)),
        parseInt($(this).val())
      );
    }
    console.log(my_cart);
  });
}

window.loadPayOrder = () => {
  let list = document.getElementById("modal-list");
  list.innerHTML = "";
  let total = 0;
  for (const [pID, q] of my_cart) {
    const p = product_by_id(pID);
    total += p.price * q;
    list.innerHTML += `
    <li class="list-group-item">
      ${p.name} - $${p.price} x ${q} = $${parseFloat(p.price * q).toFixed(2)}
    </li>`;
  }

  list.innerHTML += `
  <li class="list-group-item">
    Total: <b>$${parseFloat(total).toFixed(2)}</b>
  </li>`;
  load_address();
};

const generate_product = (op_id, name, quantity, price) => {
  return `
  <li class="list-group-item" id="li-op-${op_id}">${name} <b>X ${quantity}</b> - ${parseFloat(
    price * quantity
  ).toFixed(2)}</li>`;
};

const add_product_to_card = (pro, card) => {
  let product = product_by_id(pro.product_id);
  if (!product) {
    product = get_product_delete(pro.product_id);
  }
  card.getElementsByClassName("c-product")[0].innerHTML += generate_product(
    pro.id,
    product.name,
    pro.quantity,
    product.price
  );
};

const add_order_to_card = (o) => {
  const t_id = o.id;
  const card = document.getElementById(`card-table-${t_id}`);
  if (o.products.size) {
    for (const [k, pro] of o.products) {
      add_product_to_card(pro, card);
    }
  }
};

const load_address = () => {
  const ads = document.getElementById("modal-address");
  ads.innerHTML = `<option selected value="0">Selecciona una direccion</option>`;
  for (const [k, a] of my_address) {
    if (!a.is_deleted) {
      ads.appendChild(new Option(a.stringer, a.id));
    }
  }
};

window.capture = (id) => {
  Order.capture_payment(user.token, id);
};

window.pay_order = (id) => {
  new_function(async () => {
    const card = document.getElementById(`card-table-${id}`);
    const add = card.getElementsByClassName("select-address")[0];
    if (add.value == "0") {
      throw Error("Necesitas seleccionar una direccion de entrega");
    }
    let pay_id;
    await Order.pay_delivery_order(user.token, parseInt(id), add.value).then(
      (r) => {
        pay_id = r.id;
      }
    );
    window.location.href = `https://www.sandbox.paypal.com/checkoutnow?token=${pay_id}`;
  });
};

const pay_delivery = async (add, id) => {
  let pay_id;
  await Order.pay_delivery_order(user.token, parseInt(id), add).then((r) => {
    pay_id = r.id;
  });
  window.location.href = `https://www.sandbox.paypal.com/checkoutnow?token=${pay_id}`;
};

window.make_order = () => {
  new_function(async () => {
    if (!my_cart.size) {
      throw Error("Necesitas agregar al menos un producto al pedido");
    }
    const add = document.getElementById("modal-address");
    if (add.value == "0") {
      throw Error("Necesitas seleccionar una direccion de entrega");
    }
    await Order.create_delivery_order(user.token, my_cart).then(async (r) => {
      let ops = [];
      let i = 0;
      for (const [k, val] of my_cart) {
        ops.push({
          id: parseInt(r.product_ids[i]),
          product_id: k,
          quantity: val,
          is_ready: false,
          is_delivered: false,
        });
        i += 1;
      }

      let new_order = new Order({
        ID: r.order_id,
        total: r.total,
        user_id: user.id,
        products: ops,
        status: STATUS.COMPLETED,
      });
      my_orders.set(new_order.id, new_order);
      await pay_delivery(add.value, new_order.id);
      // document.getElementById("card-row").innerHTML +=
      //   generate_order_card(new_order);
      // add_order_to_card(new_order);
    });
    console.log(my_orders);
  }, "Pedido realizado con exito");
};

/**
 *
 * @param {Order} o
 * @param {*} count
 * @returns
 */
const generate_order_card = (o) => {
  let btn = "";
  let add = "";
  count += 1;
  if (o.status_id == STATUS.WITHOUT_PAY) {
    btn = `<div class="card-body">
    <a class="btn btn-success" onclick="pay_order('${o.id}'); return false;">Pagar</a>
</div>`;
    add = `
    <div >
        <select class="form-select w-100 select-address">
            <option selected value="0">Selecciona una direccion</option>
        </select>
    </div>`;
  } else {
    add = `<p class="card-text">${my_address.get(o.address_id).stringer}</p>`;
  }
  return `
<div class="col-sm-4  text-center">
<div>
<div class="card" id="card-table-${o.id}">
  <div class="card-header">
      <h4 class="card-title">Pedido No. ${my_orders.size - count + 1}</h4>
  </div>
  <div class="card-body">
      <p class="card-text"><b class="price-total total-${o.id}">Total: $${
    o.total
  }</b></p>
      ${add}
  </div>
  <ul class="list-group list-group-flush text-white bg-primary ul-c-p" data-bs-toggle="collapse" href="#div-c-p-${
    o.id
  }">
      <h5 class="card-title"><b>&#8811</b> Productos</h5>
      <div class="c-product collapse" id="div-c-p-${o.id}"></div>
  </ul>
  ${btn}
</div>
</div>
<div style="height: 49px"></div>
</div>`;
};

const load_my_orders = async () => {
  await Order.my_orders(user.token, { default: { limit: 0, offset: 0 } }).then(
    (r) => {
      my_orders = r;
    }
  );
  await find_deletes();

  const card = document.getElementById("card-row");
  for (const [k, o] of my_orders) {
    card.innerHTML += generate_order_card(o);
    add_order_to_card(o);
  }
  $(".ul-c-p").on("click", function () {
    console.log(this.getElementsByTagName("b")[0]);
    this.getElementsByTagName("b")[0].classList.toggle("rotate-arrow");
    return true;
  });
};

window.onload = function () {
  load_home();
};
