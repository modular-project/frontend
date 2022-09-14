export const generate_header = (headers) => {
  let n = `<tr><th scope="col">#</th>`;
  let f = `<tr><th scope="row">
  <button type="button" class="btn btn-outline-success my-2 my-sm-0">Search</button>
</th>`;
  for (const h in headers) {
    n += `<th scope="col">${headers[h]}</th>`;
    f += `<th> <form class="form-inline">
        <input name="${h}" class="form-control mr-sm-2" type="search"
            placeholder="Search" aria-label="Search">
        <select name="${h}" class="order_by">
            <option value=0 selected></option>
            <option value=1>up</option>
            <option value=-1>down</option>
        </select>
    </form></th>`;
  }
  return `<thead class="table-dark">${n}</tr> ${f}</tr></thead><tbody></tbody>`;
};

/**
 *
 * @param {any[]} data
 * @returns
 */
export const generate_body_from_array = (data, headers, callback) => {
  let b = ``;
  let count = 1;
  let func = callback;
  if (!func) {
    func = "console.log";
  }
  for (const d of data) {
    b += `<tr><th scope="row" onclick="${func}('${d["id"]}');"">${count}</th>`;
    for (const h in headers) {
      b += `<th>${d[h]}</th>`;
    }
    count += 1;
    b += `</tr>`;
  }
  return b;
};

/**
 *
 * @param {Map<BigInt,any>} data
 * @returns
 */
export const generate_body_from_data = (data, headers, callback) => {
  let b = ``;
  let count = 1;
  let func = callback;
  let temp = [];
  if (!func) {
    func = "console.log";
  }
  for (const [k, v] of data) {
    temp = [];
    b += `<tr><th scope="row" onclick="${func}('${k}');"">${count}</th>`;
    for (const h in headers) {
      if (v.length) {
        for (var i = 0; i < v.length; i++) {
          if (temp[i]) {
            temp[i].push(`<th>${v[i][h]}</th>`);
          } else {
            temp[i] = [`<th>${v[i][h]}</th>`];
          }
        }
      } else {
        b += `<th>${v[h]}</th>`;
      }
    }
    if (temp.length) {
      for (var i = 0; i < temp.length; i++) {
        b += temp[i].join("") + `</tr>`;
        count += 1;
        if (i < temp.length - 1) {
          b += `<tr><th scope="row" onclick="${func}('${k}');"">${count}</th>`;
        }
      }
    } else {
      count += 1;
      b += `</tr>`;
    }
  }
  return b;
};
/**
 *
 * @param {string[]} headers
 */
export const get_filters = (t_id) => {
  let t = document.getElementById(t_id);
  let ob = t.getElementsByClassName("order_by");
  let s = t.getElementsByClassName("form-control");
  let oba = [];
  let sa = [];
  let a = [];
  for (var i = 0; i < ob.length; i++) {
    a.push([s[i].value, ob[i].value]);
  }
  return a;
};

{
  /* <div class="row th-search" type="check">
<div class="form-check">
  <!-- Obtener los check -->
  <input class="form-check-input" type="checkbox" value="2">
  <label class="form-check-lab */
}
export const data_search_from_table = (t_id) => {
  const t = document.getElementById(t_id);
  if (!t) {
    throw Error(`No se encontro la tabla ${t_id}`);
  }
  const tr = t.getElementsByClassName("tr-filter");
  const ths = tr[0].getElementsByTagName("th");
  if (!ths) {
    throw Error("No se encontraron entradas");
  }
  let data = new Map();

  for (var i = 1; i < ths.length; i++) {
    const o = ths[i].getElementsByClassName("th-order")[0];
    const s = ths[i].getElementsByClassName("th-search")[0];
    const name = o.name;
    let val;
    let tag;
    if (s) {
      tag = s.tagName;
    }
    switch (tag) {
      case "INPUT":
        val = s.value;
        break;
      case "SELECT":
        val = s.value;
        break;
      case "DIV":
        let a = [];
        const searchs = s.getElementsByClassName("form-search");
        for (var y = 0; y < searchs.length; y++) {
          console.log(searchs[y].type);
          if (searchs[y].type == "checkbox") {
            if (searchs[y].checked) {
              a.push(searchs[y].value);
            }
          } else {
            a.push(searchs[y].value);
          }
        }
        val = a;
        break;
      default:
        break;
    }
    data.set(name, { search: val, order: o.value });
  }
  return data;
};

export const data_to_table = (t_id, data, headers, callback) => {
  const t = document.querySelector(`#${t_id}`);
  t.querySelector("tbody").innerHTML = generate_body_from_data(
    data,
    headers,
    callback
  );
};

export const clear_table = (t_id) => {
  const t = document.querySelector(`#${t_id}`);
  t.querySelector("tbody").innerHTML = "";
};
