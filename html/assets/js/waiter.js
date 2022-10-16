import { Establishment, Table } from "./module/establishment.js";
import { Order, OrderProduct } from "./module/order.js";
import { new_function } from "./module/utils.js";
import { load_menu, product_by_id } from "./product.js";
import { user as new_user, User } from "./module/user.js";
import { Product } from "./module/product.js";

/**
 * @type {Map<BigInt, Order>}
 */
let my_orders;

/**
 * @type {Map<BigInt, Table>}
 */
let tables;

let table_count = 0;

/**
 * @type {User}
 */
let user;

/**
 * @type {Map<BigInt, BigInt>}
 */
let table_order;

/**
 * @type {Map<BigInt, BigInt>}
 */
let my_cart = new Map();

let my_total = 0;

window.set_checked = (id) => {
  var ck = document.getElementById(id);
  if (ck.checked) ck.setAttribute("checked", "checked");
  else ck.removeAttribute("checked");
};

const generate_check_product = (op_id, name, quantity, price) => {
  return `
  <li class="list-group-item" id="li-op-${op_id}">
      <input class="form-check-input" type="checkbox" value="${op_id}" id="check-op-${op_id}" onclick="set_checked('check-op-${op_id}')">
      <label class="form-check-label" for="check-op-${op_id}">
          ${name} <b>X ${quantity}</b> - ${parseFloat(price * quantity).toFixed(
    2
  )}
      </label>
  </li>`;
};

const pending_to_ready = (op, t_id) => {
  delete_product_from_card(op.id);
  const card = document.getElementById(`card-table-${t_id}`);
  add_product_to_card(op, card);
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const refresh_orders = async () => {
  while (true) {
    await sleep(30000);
    console.log("refresh", my_orders);
    await Order.waiter(user.token, "p/").then((r) => {
      for (const [k, o] of r) {
        let my_o = my_orders.get(k);
        for (const [opk, op] of o.products) {
          let my_op = my_o.products.get(opk);
          if (!my_op.is_ready) {
            my_op.is_ready = true;
            console.log(
              "Ahora esta listo el producto: ",
              my_op.id,
              my_op.is_ready,
              my_orders.get(k).products.get(opk).is_ready
            );
            pending_to_ready(my_op, my_o.table_id);
          }
        }
      }
    });
  }
};

const generate_product = (op_id, name, quantity, price) => {
  return `
  <li class="list-group-item" id="li-op-${op_id}">${name} <b>X ${quantity}</b> - ${parseFloat(
    price * quantity
  ).toFixed(2)}</li>`;
};

const delete_product_from_card = (op_id) => {
  document.getElementById(`li-op-${op_id}`).remove();
};

const add_product_to_card = (pro, card) => {
  const product = product_by_id(pro.product_id);
  if (pro.is_delivered) {
    card.getElementsByClassName("c-product")[0].innerHTML += generate_product(
      pro.id,
      product.name,
      pro.quantity,
      product.price
    );
  } else if (pro.is_ready) {
    card.getElementsByClassName("r-product")[0].innerHTML +=
      generate_check_product(pro.id, product.name, pro.quantity, product.price);
  } else {
    card.getElementsByClassName("p-product")[0].innerHTML += generate_product(
      pro.id,
      product.name,
      pro.quantity,
      product.price
    );
  }
};

const add_order_to_card = (o) => {
  const t_id = o.table_id;
  const card = document.getElementById(`card-table-${t_id}`);
  card.getElementsByClassName(
    `total-${t_id}`
  )[0].textContent = `Total: ${o.total}`;
  if (o.products.size) {
    for (const [k, pro] of o.products) {
      add_product_to_card(pro, card);
    }
  }
};

const generate_card = (t_id) => {
  table_count += 1;
  return `
<div class="col-sm-4  text-center">
<div class="card" id="card-table-${t_id}">
  <div class="card-header">
      <h4 class="card-title">Mesa No. ${table_count}</h4>
  </div>
  <ul class="list-group list-group-flush bg-primary text-white">
      <h5 class="card-title">Productos listos para entregar</h5>
      <div class="r-product"></div>
  </ul>
  <ul class="list-group list-group-flush text-white bg-secondary ul-c-p" data-bs-toggle="collapse" href="#div-p-p-${t_id}">
      <h5 class="card-title"><b>&#8811</b> Productos Pendientes</h5>
      <div class="p-product collapse" id="div-p-p-${t_id}"></div>
  </ul>
  <ul class="list-group list-group-flush text-white bg-success ul-c-p" data-bs-toggle="collapse" href="#div-c-p-${t_id}">
      <h5 class="card-title"><b>&#8811</b> Productos Completados</h5>
      <div class="c-product collapse" id="div-c-p-${t_id}"></div>
  </ul>
  <div class="card-body">
      <p class="card-text"><b class="price-total total-${t_id}"></b></p>
      <a class="btn btn-primary" onclick="deliver_products('${t_id}'); return false;">Entregar Pedidos</a>
      <a class="btn btn-success" data-toggle="modal" data-target="#pay-order-modal" onclick="loadPayOrder('${t_id}'); return false;">Pagar</a>
      
  </div>
</div>
</div>`;
};

const clear_card = (t_id) => {
  const card = document.getElementById(`card-table-${t_id}`);
  card.getElementsByClassName("price-total")[0].textContent = "";
  card.getElementsByClassName("r-product")[0].innerHTML = "";
  card.getElementsByClassName("p-product")[0].innerHTML = "";
  card.getElementsByClassName("c-product")[0].innerHTML = "";
};

window.clear_c = clear_card;

window.update_total = () => {
  let mtip = document.getElementById("modal-tip");
  let mt = document.getElementById("total-modal");
  let msub = document.getElementById("modal-tip-sub");
  let sub = document.getElementById("modal-subtotal");
  let is_null = false;
  let tip = parseInt(mtip.value);
  if (!tip) {
    is_null = true;
  }
  if (tip < 0) {
    tip = 0;
  }
  if (tip > 100) {
    tip = 100;
  }
  if (!is_null) {
    mtip.value = tip;
    sub.textContent = parseFloat(my_total).toFixed(2);
    let ex = (parseFloat(my_total) * tip) / 100;
    mt.textContent = parseFloat(parseFloat(my_total) + ex).toFixed(2);
    msub.textContent = parseFloat(ex).toFixed(2);
  } else {
    mt.textContent = parseFloat(my_total).toFixed(2);
    msub.textContent = "0";
  }
};

window.loadPayOrder = (t_id) => {
  t_id = parseInt(t_id);
  const o_id = table_order.get(t_id);
  const order = my_orders.get(o_id);
  let list = document.getElementById("modal-list");
  list.innerHTML = "";
  for (const [pID, q] of order.products) {
    const p = product_by_id(q.product_id);

    list.innerHTML += `
    <li class="list-group-item">
      ${p.name} - $${p.price} x ${q.quantity} = $${parseFloat(
      p.price * q.quantity
    ).toFixed(2)}
    </li>`;
  }
  list.innerHTML += `
  <li class="list-group-item">
    SubTotal: <b>$</b><b id="modal-subtotal">${parseFloat(order.total).toFixed(
      2
    )}</b>
  </li>
  <li class="list-group-item">
    Propinas: <b>$</b><b id="modal-tip-sub">0</b>
  </li>
  <li class="list-group-item">
    Total: <b>$</b><b id="total-modal">${parseFloat(order.total).toFixed(2)}</b>
  </li>`;
  my_total = order.total;
  document.getElementById("modal-tip").value = 0;
  document.getElementById("modal-btns").innerHTML = `
  <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancelar</button>
  <button type="button" class="btn btn-primary" onclick="pay_order(${t_id})" data-dismiss="modal">Pagar</button>`;
};

window.pay_order = (t_id) => {
  new_function(async () => {
    t_id = parseInt(t_id);
    const o_id = table_order.get(t_id);
    const order = my_orders.get(o_id);
    for (const [k, o] of order.products) {
      if (!o.is_delivered) {
        throw Error("Necesitas entregar todos los productos antes de pagar");
      }
    }

    await Order.pay_local_order(
      user.token,
      o_id,
      parseFloat(document.getElementById("modal-tip").value)
    );
    my_cart.delete(o_id);
    table_order.delete(t_id);
    clear_card(t_id);
  }, "Pedido pagado con exito");
};

window.deliver_products = (t_id) => {
  new_function(async () => {
    const card = document.getElementById(`card-table-${t_id}`);
    const checkeds = card
      .getElementsByClassName("r-product")[0]
      .querySelectorAll(".form-check-input:checked");
    let ids = [];
    for (const c of checkeds) {
      ids.push(parseInt(c.value));
    }
    if (ids.length) {
      await Order.deliver_products(user.token, ids);
    } else {
      throw Error("Selecciona al menos un producto a entregar");
    }
    for (let c of checkeds) {
      const o_id = parseInt(table_order.get(parseInt(t_id)));
      document.getElementById(`li-op-${c.value}`).remove();
      console.log(t_id, o_id);
      const o = my_orders.get(o_id).products.get(parseInt(c.value));
      o.is_delivered = true;
      add_product_to_card(o, card);
    }
  });
};

window.add_item = (id) => {
  id = parseInt(id);
  const p = product_by_id(id);
  if (!my_cart.has(id)) {
    add_product_to_cart(p);
  }
};

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
      my_cart.set(
        parseInt(this.classList[0].slice(10)),
        parseInt($(this).val())
      );
    }
    console.log(my_cart);
  });
}

const set_price = (card, total) => {
  card.getElementsByClassName(
    "price-total"
  )[0].textContent = `Total: ${parseFloat(total).toFixed(2)}`;
};

window.make_order = () => {
  new_function(async () => {
    let t = document.getElementById("select-table").value;
    if (t == "0") {
      throw Error("Selecciona una mesa");
    }
    t = parseInt(t);
    const o_id = table_order.get(t);
    const card = document.getElementById(`card-table-${t}`);
    if (!o_id) {
      await Order.create_local_order(user.token, my_cart, t).then((r) => {
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
          add_product_to_card(new OrderProduct(ops[i]), card);
          i += 1;
        }
        let new_order = new Order({
          ID: r.order_id,
          total: r.total,
          table_id: parseInt(t),
          employee_id: user.id,
          address_id: user.est_id,
          products: ops,
        });
        my_orders.set(new_order.id, new_order);
        console.log;
        set_price(card, r.total);
        table_order.set(parseInt(t), new_order.id);
      });
    } else {
      if (!my_cart.size) {
        throw Error("Necesitas agregar al menos un producto al pedido");
      }
      await Order.add_products_to_order(user.token, my_cart, o_id).then((r) => {
        let ops = [];
        let i = 0;
        for (const [k, val] of my_cart) {
          ops.push({
            id: parseInt(r.ids[i]),
            product_id: k,
            quantity: val,
            is_ready: false,
            is_delivered: false,
          });
          add_product_to_card(new OrderProduct(ops[i]), card);
          i += 1;
        }
        let my_o = my_orders.get(parseInt(o_id));
        my_o.push_products(ops);
        my_o.total = parseFloat(my_o.total) + parseFloat(r.total);
        set_price(card, my_o.total);
      });
    }
    console.log(my_orders);
  }, "Pedido realizado con exito");
};

const generate_my_orders = () => {
  table_order = new Map();
  for (const [k, o] of my_orders) {
    table_order.set(o.table_id, o.id);
    add_order_to_card(o);
  }
};

const load_tables = async (t, e_id) => {
  await Establishment.get_tables(t, e_id).then((ts) => (tables = ts));
  const card = document.getElementById("card-row");
  const f = document.getElementById("select-table");
  let ct = 1;
  for (const [k, ta] of tables) {
    card.innerHTML += generate_card(ta.id);
    var opt = document.createElement("option");
    opt.value = ta.id;
    opt.innerHTML = `Mesa No. ${ct}`;
    f.appendChild(opt);
    ct += 1;
  }
  await Order.waiter(t).then((data) => (my_orders = data));
  $(".ul-c-p").on("click", function () {
    console.log(this.getElementsByTagName("b")[0]);
    this.getElementsByTagName("b")[0].classList.toggle("rotate-arrow");
    return true;
  });
  generate_my_orders();
  refresh_orders();
};

window.onload = async () => {
  await load_menu("add_item");
  user = await new_user();

  load_tables(user.token, user.est_id);
};
