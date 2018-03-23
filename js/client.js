const swal = require('sweetalert2');

$(document).ready(function() {
    // get the client index passed from the admin backend using localStorage, and store in a temporary variable
    var clientIndex = localStorage.getItem("clientIndex");

    var setGoalsButton = document.getElementById("setGoalsButton"),
        monitorGoalsButton = document.getElementById("monitorGoalsButton"),
        setGoalsDiv = document.getElementById("setGoalsDiv"),
        monitorGoalsDiv = document.getElementById("monitorGoalsDiv"),

        goalTitle = document.getElementById("goalTitle"),
        goalDescription = document.getElementById("goalDescription"),
        addGoalButton = document.getElementById("addGoalButton");

    setGoalsButton.addEventListener("click", function() {
        setGoalsDiv.style.display = "inline";
        monitorGoalsDiv.style.display = "none";
    });

    monitorGoalsButton.addEventListener("click", function() {
        setGoalsDiv.style.display = "none";
        monitorGoalsDiv.style.display = "inline";
    });

    $.ajax({
        url: "/getGoals",
        type: "post",
        data: {
            clientIndex: clientIndex
        },
        success: function(resp) {
            if(resp.status == "success") {
                for(var i = 0; i < resp.goals.length; i++) {
                    var responseGoalDiv = document.createElement("div");
                    responseGoalDiv.className = "responseGoalDiv";
                    monitorGoalsDiv.appendChild(responseGoalDiv);

                    var responseGoalTitle = document.createElement("p");
                    responseGoalTitle.className = "responseGoalTitle";
                    responseGoalTitle.innerHTML = resp.goals[i].title;
                    responseGoalDiv.appendChild(responseGoalTitle);

                    var responseGoalDescription = document.createElement("p");
                    responseGoalDescription.className = "responseGoalDescription";
                    responseGoalDescription.innerHTML = resp.goals[i].description;
                    responseGoalDiv.appendChild(responseGoalDescription);

                    var responseGoalStatus = document.createElement("p");
                    responseGoalStatus.className = "responseGoalStatus";
                    if(resp.goals[i].finished_date == null || resp.goals[i].finished_date == "") {
                        responseGoalStatus.innerHTML = "Status: In progress";
                    } else {
                        responseGoalStatus.innerHTML = "Status: finished";
                    }
                    responseGoalDiv.appendChild(responseGoalStatus);
                }
            } else {
                if(resp.status == "null") {
                    var nullMsg = document.createElement("h1");
                    nullMsg.className = "nullMsg";
                    nullMsg.value = "No goals currently assigned to this client.";
                    monitorGoalsDiv.appendChild(nullMsg);
                }
            }
        }
    })

    addGoalButton.addEventListener("click", function() {
        if(goalTitle.value !== "" && goalDescription.value !== "") {
            $.ajax({
                url: "/addGoal",
                type: "post",
                data: {
                    goalTitle: goalTitle.value,
                    goalDescription: goalDescription.value,
                    clientIndex: clientIndex
                },
                success: function(resp) {
                    if(resp.status == "success") {
                        swal({
                            type: 'success',
                            title: '<span style="color:white;font-family:sans-serif">Goal added!</span>',
                            background: 'rgb(75,75,75)'
                        })
                        .then(() => {
                            location.reload();
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