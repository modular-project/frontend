import { validate_password } from "./module/user.js";
import { Product } from "./module/product.js";

/**
 *
 * @type {Map<BigInt, Product>}
 */
  let ps;

const p = {
  order_products: new Map([
    [
      1,
      {
        id: 1,
        product_id: 2,
        quantity: 2,
        is_ready: false,
      },
    ],
    [
      2,
      {
        id: 2,
        product_id: 1,
        quantity: 5,
        is_ready: false,
      },
    ],
    [
      3,
      {
        id: 3,
        product_id: 4,
        quantity: 1,
        is_ready: false,
      },
    ],
    [
      4,
      {
        id: 4,
        product_id: 1,
        quantity: 8,
        is_ready: false,
      },
    ],
  ]),
};

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

window.pendingOrders =  async () => {

  await Product.get_all().then((d) => (ps = d));

  console.log(ps)

  const orders = document.querySelector('#orders');
  const template = document.querySelector("#ord").content;
  const fragment = document.createDocumentFragment();

  for (const [num, ob] of p.order_products) {
    template.querySelector(".box span").textContent =  ps.get(ob.product_id).name;
    template.querySelector(".box h4").textContent = `Cantidad: ${ob.quantity}`;
    template.querySelector(".box button").id = ob.id;
    template.querySelector(".box button").setAttribute("onclick", `deleteOrder('${num}');return false;`);
    template.querySelector(".box").id = `box-${num}`;

    const clone = template.cloneNode(true);
    fragment.appendChild(clone);
  }

  orders.appendChild(fragment);
}

window.deleteOrder = (id) => {
  //document.getElementById(`box-${id}`).hidden = true;
  document.getElementById(`box-${id}`).remove();
}

window.loginCook = () => {
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
  } else {
    console.log(`${uname} ${password}`);
  }
}

window.onload = function () {
  pendingOrders();
}