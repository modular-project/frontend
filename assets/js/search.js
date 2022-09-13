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
 * @param {Map<BigInt,any>} data
 * @returns
 */
export const generate_body_from_data = (data, headers, callback) => {
  let b = ``;
  let count = 1;
  let func = callback;
  if (!func) {
    func = "console.log";
  }
  for (const [k, v] of data) {
    console.log(v);
    b += `<tr><th scope="row" onclick="${func}(${k});"">${count}</th>`;
    for (const h in headers) {
      console.log(h, v[h]);
      b += `<th>${v[h]}</th>`;
    }
    count += 1;
    b += `</tr>`;
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
    switch (s.tagName) {
      case "INPUT":
        val = s.value;
        break;
      case "SELECT":
        val = s.value;
        break;
      case "DIV":
        let a = [];
        const checks = s.getElementsByClassName("form-check-input");
        for (var y = 0; y < checks.length; y++) {
          if (checks[y].checked) {
            a.push(checks[y].value);
          }
        }
        val = a;
        break;
    }
    data.set(name, { search: val, order: o.value });
  }
  return data;
};
