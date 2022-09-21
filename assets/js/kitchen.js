import { validate_password } from "./module/user.js";
import { Product } from "./module/product.js";
import { Kitchen } from "./module/kitchen.js";
import { new_function } from "./module/utils.js";
import { OrderProduct, Order } from "./module/order.js";

/**
 * @type {Map<BigInt, Product>}
 */
let ps = new Map();

let last = 0;
/**
 * @type {Map<BigInt, OrderProduct>}
 */
let pending = new Map();

// window.deleteOrder = () => {
//   let test = document.querySelectorAll('.box button');
//   let id;
//   for(let i=0;i<test.length;i++)
//   {
//       test[i].addEventListener("click", function()
//       {
//           console.log(`El id del boton es ${this.id}`);
//       });
//   }
// }

window.pendingOrders = async () => {
  await Order.kitchen(Kitchen.token(), last).then((r) => {
    pending = r[0];
    last = r[1];
  });

  const orders = document.querySelector("#orders");
  const template = document.querySelector("#ord").content;
  const fragment = document.createDocumentFragment();

  for (const [num, ob] of pending) {
    template.querySelector(".element-order").id = `box-${num}`;
    template.querySelector(".box span").textContent = ps.get(
      ob.product_id
    ).name;
    template.querySelector(".box h4").textContent = `Cantidad: ${ob.quantity}`;
    template.querySelector(".box button").id = ob.id;
    template
      .querySelector(".box button")
      .setAttribute("onclick", `deleteOrder('${num}');return false;`);
    // template.querySelector(".box").id = `box-${num}`;

    const clone = template.cloneNode(true);
    fragment.appendChild(clone);
  }

  orders.appendChild(fragment);
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const refresh = async () => {
  while (true) {
    await sleep(60000);
    pendingOrders();
  }
};

window.deleteOrder = async (id) => {
  await Order.complete_product(Kitchen.token(), id).then(() =>
    document.getElementById(`box-${id}`).remove()
  );
};

window.loginCook = async () => {
  new_function(async () => {
    let uname = document.getElementById("unameISC").value;
    let password = document.getElementById("passISC").value;

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
    await Kitchen.login(uname, password);
    window.location.reload(true);
  });
};

window.signout = () => {
  Kitchen.signout();
  window.location.href = "index.html";
};

window.onload = async () => {
  if (Kitchen.is_login()) {
    await Product.get_all().then((d) => (ps = d));
    pendingOrders();
    refresh();
    document.getElementById("contact").remove();
  } else {
    document.getElementById("why-us").remove();
    document.getElementById("signout-btn").remove();
  }
};
