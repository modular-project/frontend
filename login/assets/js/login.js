let url = "https://e5a924a0-82cc-4cae-a959-8c29cceba390.mock.pstmn.io";

function login() {

    let email = document.getElementById("email").value;
    let pass = document.getElementById("password").value;

    fetch(url + "/api/v1/user/signin/", 
    {
        method:"POST", 
        headers:{"Content-Type":"application/json;charset=utf-8"}, 
        body:JSON.stringify({"user":email, "password":pass})
    })
    .then(response => response.json()
    .then(data => window.localStorage.setItem("token", data["message"])));

    console.log(email, " ", pass);
}

function validate_email() {

    let email = document.getElementById("email").value;

    if (/^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i.test(email)){
        return true;
    }
}

function validate_password() {

    let pass = document.getElementById("password").value;

    if (/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!¡%*¿?/&\+\-\\#'.$($)$-$_])[A-Za-z\d$@$!¡%*¿?/&\+\-\\#'.$($)$-$_]{8,15}$/.test(pass)){
        return true;
    }
}

function enable_btn() {

    let loginbtn = document.getElementById("loginbtn");
    let signupbtn = document.getElementById("signupbtn");

    if (validate_email() && validate_password()){
        loginbtn.disabled = false;
        signupbtn.disabled = false;
    }
    else {
        loginbtn.disabled = true;
        signupbtn.disabled = true;
    }
}

