const swal = require('sweetalert2');

$(document).ready(function() {
    var manageGoalsButton = document.getElementById("manageGoalsButton"),
        regNewClientButton = document.getElementById("regNewClientButton"),
        removeClientButton = document.getElementById("removeClientButton"),
        changePassButton = document.getElementById("changePassButton"),
        logoutButton = document.getElementById("logoutButton"),

        manageGoalsView = document.getElementById("manageGoalsView"),
        regNewClientView = document.getElementById("regNewClientView"),
        removeClientView = document.getElementById("removeClientView"),
        changePassView = document.getElementById("changePassView"),
        
        regNewFname = document.getElementById("regNewFname"),
        regNewLname = document.getElementById("regNewLname"),
        regNewEmail = document.getElementById("regNewEmail"),
        regNewPassword = document.getElementById("regNewPassword"),
        regNewButton = document.getElementById("regNewButton"),

        oldPass = document.getElementById("oldPass"),
        newPass = document.getElementById("newPass"),
        newPassConfirm = document.getElementById("newPassConfirm"),
        confirmPassButton = document.getElementById("confirmPassButton"),
        regexEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        regexPassword = /^[a-zA-Z0-9]{4,23}$/,
        regexName = /^[a-zA-Z]{2,23}$/;

    manageGoalsButton.style.background = "linear-gradient(rgb(60,60,60), rgb(85,85,85))";

    var buttons = [manageGoalsButton, regNewClientButton, removeClientButton, changePassButton];
    //This Function makes the selected menu "glow/highlighted" when it's clicked
    var active;
    function glow(active) {
        for(var i=0; buttons.length > i; i++) {
            if(buttons[i] == active) {
                buttons[i].style.background = "linear-gradient(rgb(60,60,60), rgb(85,85,85))";
            } else {
                buttons[i].style.background = "rgb(85,85,85)";
            }
        }
    }

    manageGoalsButton.addEventListener("click", function() {
        glow(manageGoalsButton);
        manageGoalsView.style.display = "inline";
        regNewClientView.style.display = "none";
        removeClientView.style.display = "none";
        changePassView.style.display = "none";
    });

    regNewClientButton.addEventListener("click", function() {
        glow(regNewClientButton);
        manageGoalsView.style.display = "none";
        regNewClientView.style.display = "inline";
        removeClientView.style.display = "none";
        changePassView.style.display = "none";
    });

    removeClientButton.addEventListener("click", function() {
        glow(removeClientButton);
        manageGoalsView.style.display = "none";
        regNewClientView.style.display = "none";
        removeClientView.style.display = "inline";
        changePassView.style.display = "none";
    });

    changePassButton.addEventListener("click", function() {
        glow(changePassButton);
        manageGoalsView.style.display = "none";
        regNewClientView.style.display = "none";
        removeClientView.style.display = "none";
        changePassView.style.display = "inline";
    });

    logoutButton.addEventListener("click", function() {
        $.ajax({
            url: "/logout",
            type: "post",
            success: function(resp) {
                if(resp.status == "success") {
                    var url = window.location.href;
                    window.history.go(-window.history.length);
                    window.location.href = url;
                }
            }
        });
    });

    confirmPassButton.addEventListener("click", function() {
        var oldPassword = "";
        var newPassword = "";
        var confirmPassword = "";
        if(regexPassword.test(oldPass.value)){
            var oldPassword = oldPass.value;
        }

        if(regexPassword.test(newPass.value)){
            var newPassword = newPass.value;
        }

        if(regexPassword.test(newPassConfirm.value)){
            var confirmPassword = newPassConfirm.value;
        }

        //check if all regex for the inputs pass
        if(regexPassword.test(oldPass.value) && 
        regexPassword.test(newPass.value) && 
        regexPassword.test(newPassConfirm.value) &&
        newPassword == confirmPassword){
            $.ajax({
                url: "/changePassword",
                type: "post",
                data: {
                    old_password: oldPassword,
                    new_password: newPassword
                },
                success: function(resp) {
                    if(resp.status == "success") {
                        swal({
                            type: 'success',
                            title: '<span style="color:white;font-family:sans-serif">Password changed</span>',
                            background: 'rgb(75,75,75)'
                        }).then(() => {
                            location.reload();
                        });
                    } else {
                        swal({
                            type: 'error',
                            title: '<span style="color:white;font-family:sans-serif">Old password is incorrect</span>',
                            background: 'rgb(75,75,75)'
                        }).then(() => {
                            oldPass.value = "";
                            newPass.value = "";
                            newPassConfirm.value = "";
                        });
                    }
                }
            });
        } else {
            swal({
                type: 'error',
                title: '<span style="color:white;font-family:sans-serif">Invalid inputs</span><br><span style="color:rgb(175,175,175);font-size:15px;font-family:sans-serif">Please make sure all inputs are valid</span>',
                background: 'rgb(75,75,75)'
            }).then(() => {
                oldPass.value = "";
                newPass.value = "";
                newPassConfirm.value = "";
            });
        }
    });

    $.ajax({
        url: "/showClients",
        type: "post",
        success: function(resp) {
            if(resp.status == "success") {
                for(var i = 0; i < resp.clients.length; i++) {
                    var clientDiv = document.createElement("div");
                    clientDiv.className = "clientDiv";
                    manageGoalsView.appendChild(clientDiv);

                    var client = document.createElement("div");
                    client.className = "client";
                    client.innerHTML = resp.clients[i].fname + " " + resp.clients[i].lname;
                    clientDiv.appendChild(client);

                    var clientEmail = document.createElement("div");
                    clientEmail.className = "clientEmail";
                    clientEmail.innerHTML = resp.clients[i].email;
                    clientDiv.appendChild(clientEmail);

                    var clientButton = document.createElement("button");
                    clientButton.className = "clientButton";
                    clientButton.innerHTML = "Manage goals";
                    clientButton.myindex = i;
                    clientButton.clientindex = resp.clients[i].user_id;
                    clientButton.clientname = resp.clients[i].fname + " " + resp.clients[i].lname;
                    clientDiv.appendChild(clientButton);

                    clientButton.addEventListener("click", function() {
                        //pass the client index to the client backend using localStorage
                        localStorage.setItem("clientIndex", this.clientindex);
                        localStorage.setItem("clientName", this.clientname);

                        //change the location to this new link with index as the parameter
                        location.href = "/client/"+this.myindex;
                    });
                }
            } else if(resp.status == "null") {
                var noClients = document.createElement("p");
                noClients.className = "noClients";
                noClients.innerHTML = "No clients available to manage.";
                noClients.style.textAlign = "center";

                manageGoalsView.appendChild(noClients);
            }
        }
    });

    regNewButton.addEventListener("click", function() {
        if(regNewFname.value !== "" && regNewLname.value !== "" && regNewEmail.value !== "" && regNewPassword.value !== "") {
            if(regexName.test(regNewFname.value) && regexName.test(regNewLname.value) && regexEmail.test(regNewEmail.value) && regexPassword.test(regNewPassword.value) == true) {
                $.ajax({
                    url: "/registerClient",
                    data: {
                        regNewFname: regNewFname.value,
                        regNewLname: regNewLname.value,
                        regNewEmail: regNewEmail.value,
                        regNewPassword: regNewPassword.value,
                    },
                    type: "post",
                    success: function(resp) {
                        if(resp.status == "success") {
                            swal({
                                type: 'success',
                                title: '<span style="color:white;font-family:sans-serif">Account registered</span><br><span style="color:rgb(175,175,175);font-size:15px;font-family:sans-serif">'+resp.fname+' '+resp.lname+' has been added!</span>',
                                background: 'rgb(75,75,75)'
                            }).then(() => {
                                location.reload();
                            });
                        } else if(resp.status == "duplicate") {
                            swal({
                                type: 'error',
                                title: '<span style="color:white;font-family:sans-serif">Registration failed</span><br><span style="color:rgb(175,175,175);font-size:15px;font-family:sans-serif">E-mail already exists</span>',
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

    $.ajax({
        url: "/showClients",
        type: "post",
        success: function(resp) {
            if(resp.status == "success") {
                for(var i = 0; i < resp.clients.length; i++) {
                    var removeClientDiv = document.createElement("div");
                    removeClientDiv.className = "removeClientDiv";
                    removeClientView.appendChild(removeClientDiv);

                    var removeClient = document.createElement("div");
                    removeClient.className = "client";
                    removeClient.innerHTML = resp.clients[i].fname + " " + resp.clients[i].lname;
                    removeClientDiv.appendChild(removeClient);

                    var removeClientEmail = document.createElement("div");
                    removeClientEmail.className = "clientEmail";
                    removeClientEmail.innerHTML = resp.clients[i].email;
                    removeClientDiv.appendChild(removeClientEmail);

                    var removeClientButton = document.createElement("button");
                    removeClientButton.className = "clientButton";
                    removeClientButton.innerHTML = "Remove Client";
                    removeClientButton.myindex = i;
                    removeClientButton.clientindex = resp.clients[i].user_id;
                    removeClientDiv.appendChild(removeClientButton);

                    removeClientButton.addEventListener("click", function() {
                        swal({
                            title: "<span style=\"color:white;font-family:sans-serif\">Are you sure?</span><br><span style=\"color:rgb(175,175,175);font-size:15px;font-family:sans-serif\">The client's tasks will also be deleted</span>",
                            type: "warning",
                            showCancelButton: true,
                            confirmButtonColor: '#d33',
                            cancelButtonColor: '#3085d6',
                            confirmButtonText: 'Remove',
                            background: 'rgb(75,75,75)'
                        }).then((result) => {
                            if (result.value) {

                                $.ajax({
                                    url: "/deleteClient",
                                    type: "post",
                                    data: {
                                        clientIndex: this.clientindex
                                    },
                                    success: function(resp) {
                                        if(resp.status == "success") {
                                            swal({
                                                title: "<span style=\"color:white;font-family:sans-serif\">Client Removed</span><br><span style=\"color:rgb(175,175,175);font-size:15px;font-family:sans-serif\">All tasks associated with the client also deleted</span>",
                                                type: "success",
                                                background: "rgb(75,75,75)"
                                            }).then(() => {
                                                location.reload();
                                            });
                                        }
                                    }
                                });

                            }
                        });
                    });
                }
            } else if(resp.status == "null") {
                var noClients = document.createElement("p");
                noClients.className = "noClients";
                noClients.innerHTML = "No clients available to delete.";
                noClients.style.textAlign = "center";

                removeClientView.appendChild(noClients);
            }
        }
    });

});