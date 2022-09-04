import { User } from "./module/user.js";

window.update_user = function update_user() {
  let name = document.getElementById("name").value;
  let url = document.getElementById("url").value;
  let bdate = document.getElementById("bdate").value;

  const date = new Date(bdate);
  const unixDate = Math.floor(date.getTime() / 1000);
  const t = Date.parse(bdate);

  let u = new User(
    JSON.stringify({ name: name, url: url, bdate: date.toISOString() })
  );
  console.log(name, " ", url, " ", bdate, " ", unixDate, t);
  u.update();
};
