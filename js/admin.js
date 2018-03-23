const swal = require('sweetalert2');

$(document).ready(function() {
    var manageGoalsButton = document.getElementById("manageGoalsButton"),
        regNewClientButton = document.getElementById("regNewClientButton"),
        removeClientButton = document.getElementById("removeClientButton"),
        manageGoalsView = document.getElementById("manageGoalsView"),
        regNewClientView = document.getElementById("regNewClientView"),
        removeClientView = document.getElementById("removeClientView"),
        
        regNewFname = document.getElementById("regNewFname"),
        regNewLname = document.getElementById("regNewLname"),
        regNewEmail = document.getElementById("regNewEmail"),
        regNewPassword = document.getElementById("regNewPassword"),
        regNewButton = document.getElementById("regNewButton");

    manageGoalsButton.addEventListener("click", function() {
        manageGoalsView.style.display = "inline";
        regNewClientView.style.display = "none";
        removeClientView.style.display = "none";
    });

    regNewClientButton.addEventListener("click", function() {
        manageGoalsView.style.display = "none";
        regNewClientView.style.display = "inline";
        removeClientView.style.display = "none";
    });

    removeClientButton.addEventListener("click", function() {
        manageGoalsView.style.display = "none";
        regNewClientView.style.display = "none";
        removeClientView.style.display = "inline";
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

                    var client = document.createElement("p");
                    client.className = "client";
                    client.innerHTML = resp.clients[i].fname + " " + resp.clients[i].lname;
                    clientDiv.appendChild(client);

                    var clientButton = document.createElement("button");
                    clientButton.className = "clientButton";
                    clientButton.innerHTML = "Manage goals";
                    clientButton.myindex = i;
                    clientButton.clientindex = resp.clients[i].user_id;
                    clientDiv.appendChild(clientButton);

                    clientButton.addEventListener("click", function() {
                        //pass the client index to the client backend using localStorage
                        localStorage.setItem("clientIndex", this.clientindex);

                        //change the location to this new link with index as the parameter
                        location.href = "/client/"+this.myindex;
                    });
                }
            } else if(resp.status == "null") {
                var noClients = document.createElement("p");
                noClients.className = "noClients";
                noClients.innerHTML = "No clients available to manage.";

                manageGoalsView.appendChild(noClients);
            }
        }
    });

    regNewButton.addEventListener("click", function() {
        if(regNewFname.value !== "" && regNewLname.value !== "" && regNewEmail.value !== "" && regNewPassword.value !== "") {
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
                            title: '<span style="color:white;font-family:sans-serif">Account registered.</span><br><span style="color:rgb(175,175,175);font-size:15px;font-family:sans-serif">'+resp.fname+' '+resp.lname+' has been added!</span>',
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