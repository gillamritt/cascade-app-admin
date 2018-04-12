const swal = require('sweetalert2');

var loginEmail = document.getElementById("loginEmail"),
    loginPassword = document.getElementById("loginPassword"),
    loginSubmit = document.getElementById("loginSubmit"),

    regiterNowButton = document.getElementById("registerNowButton");

regiterNowButton.addEventListener("click", function() {
    location.href = "/register";
});

$(document).ready(function() {

    loginSubmit.addEventListener("click", function() {
        if(loginEmail.value !== "" && loginPassword.value !== "") {
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
                    } else if(resp.status == "fail") {
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
});