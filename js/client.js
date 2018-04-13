const swal = require('sweetalert2');
const Chart = require('chart.js');
const moment = require('moment');

var goalsCompleted = 0,
    goalsMissed = 0,
    goalsInProgress = 0;

$(document).ready(function() {
    // get the client index passed from the admin backend using localStorage, and store in a temporary variable
    var clientIndex = localStorage.getItem("clientIndex"),
        clientName = localStorage.getItem("clientName"),

        clientNameText = document.getElementById("clientNameText"),
        backToMenu = document.getElementById("backToMenu"),

        setGoalsButton = document.getElementById("setGoalsButton"),
        monitorGoalsButton = document.getElementById("monitorGoalsButton"),
        setGoalsDiv = document.getElementById("setGoalsDiv"),
        monitorGoalsDiv = document.getElementById("monitorGoalsDiv"),

        goalTitle = document.getElementById("goalTitle"),
        goalDescription = document.getElementById("goalDescription"),
        goalDueDate = document.getElementById("goalDueDate"),
        addGoalButton = document.getElementById("addGoalButton"),

        ctx = document.getElementById("myChart").getContext("2d");

    clientNameText.innerHTML = clientName;

    backToMenu.addEventListener("click", function() {
        location.href = "/admin";
    });

    setGoalsButton.addEventListener("click", function() {
        setGoalsDiv.style.display = "inline";
        monitorGoalsDiv.style.display = "none";
    });

    monitorGoalsButton.addEventListener("click", function() {
        setGoalsDiv.style.display = "none";
        monitorGoalsDiv.style.display = "inline";
    });

    addGoalButton.addEventListener("click", function() {

        var date = new Date();
        var goalStartDate = date.toISOString();

        if(goalTitle.value !== "" && goalDescription.value !== "" && goalDueDate.value !== "") {
            if(Date.parse(goalStartDate) < Date.parse(goalDueDate.value)) {
                $.ajax({
                    url: "/addGoal",
                    type: "post",
                    data: {
                        goalTitle: goalTitle.value,
                        goalDescription: goalDescription.value,
                        goalDueDate: goalDueDate.value,
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
                    title: '<span style="color:white;font-family:sans-serif">Due Date cannot be set in past</span>',
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
        url: "/getGoals",
        type: "post",
        data: {
            clientIndex: clientIndex
        },
        success: function(resp) {
            if(resp.status == "success") {

                var currentDate = new Date();
                var currentDateString = currentDate.toISOString();

                var parsedDate = Date.parse(currentDateString);


                for(var i = 0; i < resp.goals.length; i++) {
                    console.log(Date.parse(resp.goals[i].due_date));
                    console.log(parsedDate);
                    console.log(i + ': ' + Date.parse(resp.goals[i].due_date) < parsedDate);
                    if(Date.parse(resp.goals[i].due_date) < parsedDate && resp.goals[i].finished_date == null && resp.goals[i].missed == false) {
                        $.ajax({
                            url: "/taskMissed",
                            type: "post",
                            data: {
                                goalId: resp.goals[i].goal_id
                            },
                            success: function(resp) {
                                if(resp.status == "success") {
                                    console.log("working");
                                } else {
                                    console.log("not working");
                                }
                            }
                        });
                    }

                    if(resp.goals[i].missed == false && resp.goals[i].finished_date != null) {
                        goalsCompleted += 1;
                    } else if(resp.goals[i].missed == true) {
                        goalsMissed += 1;
                    } else {
                        goalsInProgress += 1;
                    }

                    if(resp.goals[i].show == true) {
                        var responseGoalDiv = document.createElement("div");
                        responseGoalDiv.className = "responseGoalDiv";
                        responseGoalDiv.style.marginBottom = "10px"; //TEMPORARY *****************************************************
                        monitorGoalsDiv.appendChild(responseGoalDiv);

                        var responseGoalTitle = document.createElement("div");
                        responseGoalTitle.className = "responseGoalTitle";
                        responseGoalTitle.innerHTML = resp.goals[i].title;
                        responseGoalDiv.appendChild(responseGoalTitle);

                        var responseGoalDescription = document.createElement("div");
                        responseGoalDescription.className = "responseGoalDescription";
                        responseGoalDescription.innerHTML = resp.goals[i].description;
                        responseGoalDiv.appendChild(responseGoalDescription);

                        var responseGoalDueDate = document.createElement("div");
                        responseGoalDueDate.className = "responseGoalDueDate";
                        responseGoalDueDate.innerHTML = "Due Date: " + 
                        moment(resp.goals[i].due_date).add(7, 'h').format('MMMM Do YYYY, h:mm a');
                        responseGoalDiv.appendChild(responseGoalDueDate);

                        
                        var responseGoalStatusText = document.createElement("div");
                        responseGoalStatusText.className = "responseGoalStatusText";
                        responseGoalStatusText.innerHTML = "Status: ";
                        responseGoalStatusText.style.display = "inline"; //TEMPORARY *****************************************************
                        responseGoalDiv.appendChild(responseGoalStatusText);
                        
                        var responseGoalStatus = document.createElement("div");
                        responseGoalStatus.className = "responseGoalStatus";
                        if(resp.goals[i].missed == true) {
                            responseGoalStatus.innerHTML = "Missed";
                            responseGoalStatus.style.color = "#ef5350";
                        } else if(resp.goals[i].missed == false && resp.goals[i].finished_date == null) {
                            responseGoalStatus.innerHTML = "In progress";
                            responseGoalStatus.style.color = "rgb(0,198,255)";
                        } else {
                            responseGoalStatus.innerHTML = "Completed";
                            responseGoalStatus.style.color = "#00e676";
                        }
                        responseGoalStatus.style.display = "inline"; //TEMPORARY *****************************************************
                        responseGoalDiv.appendChild(responseGoalStatus);

                        var deleteGoalButton = document.createElement("button");
                        deleteGoalButton.className = "deleteGoalButton";
                        deleteGoalButton.innerHTML = "Delete";
                        deleteGoalButton.goalindex = resp.goals[i].goal_id;
                        responseGoalDiv.appendChild(deleteGoalButton);

                        if(resp.goals[i].missed == false && resp.goals[i].finished_date == null) {
                            deleteGoalButton.style.display = "block";
                        } else {
                            deleteGoalButton.style.display = "none";
                        }

                        deleteGoalButton.addEventListener("click", function() {
                            swal({
                                title: "<span style=\"color:white;font-family:sans-serif\">Are you sure?</span><br><span style=\"color:rgb(175,175,175);font-size:15px;font-family:sans-serif\">The client will no longer see this task</span>",
                                type: "warning",
                                showCancelButton: true,
                                confirmButtonColor: '#d33',
                                cancelButtonColor: '#3085d6',
                                confirmButtonText: 'Delete',
                                background: 'rgb(75,75,75)'
                            }).then((result) => {
                                if (result.value) {

                                    $.ajax({
                                        url: "/deleteGoal",
                                        type: "post",
                                        data: {
                                            goalIndex: this.goalindex
                                        },
                                        success: function(resp) {
                                            if(resp.status == "success") {
                                                swal({
                                                    title: "<span style=\"color:white;font-family:sans-serif\">Goal Deleted</span>",
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

                        var clearGoalButton = document.createElement("button");
                        clearGoalButton.className = "clearGoalButton";
                        clearGoalButton.innerHTML = "Clear";
                        clearGoalButton.clearindex = resp.goals[i].goal_id;
                        responseGoalDiv.appendChild(clearGoalButton);
                        
                        if(resp.goals[i].missed == false && resp.goals[i].finished_date == null) {
                            clearGoalButton.style.display = "none";
                        } else {
                            clearGoalButton.style.display = "block";
                        }

                        clearGoalButton.addEventListener("click", function() {
                            $.ajax({
                                url: "/clearGoal",
                                type: "post",
                                data: {
                                    clearIndex: this.clearindex
                                },
                                success: function(resp) {
                                    if(resp.status == "success") {
                                        swal({
                                            title: "<span style=\"color:white;font-family:sans-serif\">Goal Cleared</span>",
                                            type: "success",
                                            background: "rgb(75,75,75)",
                                            showConfirmButton: false,
                                            allowOutsideClick: false
                                        });
                                        setTimeout(function() {
                                            location.reload();
                                        }, 2000);
                                    }
                                }
                            });
                        });
                    }
                }

                var completionChart = new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        datasets: [{
                            data: [goalsCompleted, goalsMissed, goalsInProgress],
                            backgroundColor: ['#00e676', '#ef5350', 'rgb(0,198,255)']
                        }],
                        
                        // These labels appear in the legend and in the tooltips when hovering different arcs
                        labels: [
                            'Completed',
                            'Missed',
                            'In Progress'
                        ],
                        borderWidth: 1,
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                                yAxes: [{
                                    ticks: {
                                        beginAtZero:true
                                    }
                                }]
                            }
                        }
                    }
                });
                Chart.defaults.global.defaultFontColor = "#fff";

            } else {
                if(resp.status == "null") {
                    var nullMsg = document.createElement("h1");
                    nullMsg.className = "nullMsg";
                    nullMsg.innerHTML = "No goals currently assigned to this client.";
                    nullMsg.style.textAlign = "center";
                    monitorGoalsDiv.appendChild(nullMsg);
                }
            }
        }
    });
});