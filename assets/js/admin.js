import { load_menu, BASES } from "./product.js";
import { new_function } from "./module/utils.js";
import { upload_img } from "./module/image.js";

window.change_prod_pic = () => {
  let new_img = document.getElementById("create-img");
  document.getElementById("create-product-pic").src = URL.createObjectURL(
    new_img.files[0]
  );
  is_img_updated = true;
};

window.createProduct = () => {
  new_function(async () => {
    let nombre = document.getElementById("nombre").value;
    let precio = document.getElementById("precio").value;
    let descripcion = document.getElementById("desc").value;
    let base = document.getElementById("create-base").value;

    console.log(`${nombre} ${precio} ${descripcion} ${base}`);
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
};

window.onload = function () {
  load_admin();
};
