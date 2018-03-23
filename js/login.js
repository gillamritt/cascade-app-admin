const swal = require('sweetalert2');

var loginContainer = document.getElementById("loginContainer"),
    loginEmail = document.getElementById("loginEmail"),
    loginPassword = document.getElementById("loginPassword"),
    loginSubmit = document.getElementById("loginSubmit"),
    switch2reg= document.getElementById("switch2reg"),

    registerContainer = document.getElementById("registerContainer"),
    registerFname = document.getElementById("registerFname"),
    registerLname = document.getElementById("registerLname"),
    registerEmail = document.getElementById("registerEmail"),
    registerPassword = document.getElementById("registerPassword"),
    registerSubmit = document.getElementById("registerSubmit"),
    switch2log= document.getElementById("switch2log");

switch2log.addEventListener("click", function() {
    loginContainer.style.display = "inline";
    registerContainer.style.display = "none";
});

switch2reg.addEventListener("click", function() {
    registerContainer.style.display = "inline";
    loginContainer.style.display = "none";
});

$(document).ready(function(){
    console.log("login page");

    loginSubmit.addEventListener("click", function() {
        if(loginEmail.value !== "" && loginPassword.value !== "" ) {
            $.ajax({
                url: "/login",
                data: {
                    loginEmail: loginEmail.value,
                    loginPassword: loginPassword.value
                },
                type: "post",
                success: function(resp) {
                    if(resp.status == "success") {
                        location.href = "/admin";
                    } else {
                        swal({
                            type: 'error',
                            title: '<span style="color:white;font-family:sans-serif">Incorrect login information</span>',
                            background: 'rgb(75,75,75)'
                        });
                    }
                }
            });
        } else {
            swal({
                type: 'error',
                title: '<span style="color:white;font-family:sans-serif">Please fill out all fields</span>',
                background: 'rgb(75,75,75)'
            });
        }
    });

    registerSubmit.addEventListener("click", function() {
        if(registerFname.value !== "" && registerLname.value !== "" && registerEmail.value !== "" && registerPassword.value !== "") {
            $.ajax({
                url: "/register",
                data: {
                    registerFname: registerFname.value,
                    registerLname: registerLname.value,
                    registerEmail: registerEmail.value,
                    registerPassword: registerPassword.value,
                },
                type: "post",
                success: function(resp) {
                    if(resp.status == "success") {
                        swal({
                            type: 'success',
                            title: '<span style="color:white;font-family:sans-serif">Account registered.</span><br><span style="color:rgb(175,175,175);font-size:15px;font-family:sans-serif">Welcome '+resp.fname+' '+resp.lname+'!</span>',
                            background: 'rgb(75,75,75)'
                        }).then(() => {
                            location.reload();
                        });
                    } else if(resp.status == "duplicate") {
                        swal({
                            type: 'error',
                            title: '<span style="color:white;font-family:sans-serif">Registration failed.</span><br><span style="color:rgb(175,175,175);font-size:15px;font-family:sans-serif">E-mail already exists</span>',
                            background: 'rgb(75,75,75)'
                        });
                    }
                }
            });
        } else {
            swal({
                type: 'error',
                title: '<span style="color:white;font-family:sans-serif">Please fill out all fields</span>',
                background: 'rgb(75,75,75)'
            });
        }
    });
});