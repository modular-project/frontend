const ps = new Map();

data = JSON.parse(`[
    {
        "id":1,
        "name": "producto 1",
        "price": 14.52
    },
    {
        "id":2,
        "name": "Enchiladas",
        "url": "www.imagen.google.com/enchilada",
        "description": "Platillo con 5 enchiladas, queso, cebolla y lechuga",
        "price": 13.45
    },
    {
        "id":4,
        "name": "Enchiladas",
        "description": "Platillo con 5 enchiladas, queso, cebolla y lechuga",
        "price": 13.45
    }
]`);

console.log(data[0]["name"]);

for (d of data) {
  ps.set(d["id"], d);
  //   console.log(d)
}

console.log(ps.get(1)["id"]);

ps.forEach((k, v) => {
  console.log(k, v);
});
