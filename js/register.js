const swal = require('sweetalert2');

var registerFname = document.getElementById("registerFname"),
    registerLname = document.getElementById("registerLname"),
    registerEmail = document.getElementById("registerEmail"),
    registerPassword = document.getElementById("registerPassword"),
    registerSubmit = document.getElementById("registerSubmit")
    
    loginButton = document.getElementById("loginButton"),

    regexEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    regexPassword = /^[a-zA-Z0-9]{4,23}$/,
    regexName = /^[a-zA-Z]{2,23}$/;

loginButton.addEventListener("click", function() {
    location.href = "/";
});

$(document).ready(function() {

    registerSubmit.addEventListener("click", function() {
        if(registerFname.value !== "" && registerLname.value !== "" && registerEmail.value !== "" && registerPassword.value !== "") {
            if(regexName.test(registerFname.value) && regexName.test(registerLname.value) && regexEmail.test(registerEmail.value) && regexPassword.test(registerPassword.value) == true) {
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
                    title: '<span style="color:white;font-family:sans-serif">Invalid inputs</span>',
                    background: 'rgb(75,75,75)'
                });
            }
        } else {
            swal({
                type: 'error',
                title: '<span style="color:white;font-family:sans-serif">Please fill out all fields</span>',
                background: 'rgb(75,75,75)'
            });
        }
    });

});