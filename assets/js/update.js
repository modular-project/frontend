function update() {
    let name = document.getElementById("name").value;
    let url = document.getElementById("url").value;
    let bdate = document.getElementById("bdate").value;

    const date = new Date(bdate);
    const unixDate = Math.floor(date.getTime() / 1000);
    
    console.log(name, " ", url, " ", bdate, " ", unixDate);
}