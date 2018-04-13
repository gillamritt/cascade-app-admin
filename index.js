const bodyParser = require("body-parser");
const session = require("express-session");
const port = process.env.PORT || 10000;
const express = require("express");
const path = require("path");
const pg = require("pg");
const bcrypt = require("bcrypt");

// initialize server
var app = express();
const server = require("http").createServer(app);

// setup for db, server & folders
var io = require("socket.io")(server);
var pF = path.resolve(__dirname, "public");
var sF = path.resolve(__dirname, "js");

// var dbURL = process.env.DATABASE_URL || 'postgres://cascadeapp:teamcascade@cascade-db.cxnma2xuxlgy.us-west-2.rds.amazonaws.com:5432/cascadeapp';
var dbURL = process.env.DATABASE_URL || 'postgres://followthru:cascadeapp@follow-thru-db.czto5vbsmdqt.us-west-2.rds.amazonaws.com:5432/followthru';

const client = new pg.Client(dbURL);
client.connect();

// use body parser
app.use(bodyParser.urlencoded({
    extended: true
}));

// use sessions
app.use(session({
    secret: "this secret is very important, don't tell anyone",
    resave: true,
    saveUninitialized: true
}));

function checkLogin(req) {
    if(!req.session.user || req.session == undefined) {
        return false;
    } else {
        return true;
    }
}

// redirect to folders
app.use("/scripts", express.static("build"));
app.use("/styles", express.static("css"));
app.use("/images", express.static("media"));
app.use("/bower", express.static("bower_components"));

// get pages
app.get("/", function (req, resp) {
    resp.sendFile(pF+"/login.html");
});

app.get("/register", function (req, resp) {
    resp.sendFile(pF+"/register.html");
})

app.get("/admin", function (req, resp) {
    if(checkLogin(req)) {
        resp.sendFile(pF+"/admin.html");
    } else {
        resp.sendFile(pF+"/login.html");
    }
});

// using : in the url will notify express that this part after / is not a solid link
app.get("/client/:clientindex", function(req, resp) {
    var index = req.params.clientindex;
    
    // store the room id to the sessions
    req.session.clientNum = index;
    
    if(checkLogin(req)) {
        resp.sendFile(pF+"/client.html");
    } else {
        resp.sendFile(pF+"/login.html");
    }
});

// register
app.post("/register", function(req, resp) {
    client.query("SELECT * FROM users WHERE email = $1;", [req.body.registerEmail], function(err, result) {
        if(err) {
            console.log(err);
            resp.send({
                status: "fail"
            });
        } else {
            if(result.rows == 0) {
                bcrypt.hash(req.body.registerPassword, 5, function(err, bpass) {
                    client.query("INSERT INTO users (email, password, lname, fname, is_admin) VALUES ($1, $2, $3, $4, $5) RETURNING lname, fname;",
                    [req.body.registerEmail, bpass, req.body.registerLname, req.body.registerFname, true], function(err, result2) {
                        if(err) {
                            console.log(err);
                            resp.send({
                                status: "fail"
                            });
                        } else {
                            resp.send({
                                status: "success",
                                fname: result2.rows[0].fname,
                                lname: result2.rows[0].lname
                            });
                        }
                    });
                });
            } else {
                resp.send({
                    status: "duplicate"
                });
            }
        }
    });
});

// login
app.post("/login", function(req, resp) {
    client.query("SELECT user_id, email, password, is_admin FROM users WHERE email = $1;",
    [req.body.loginEmail], function(err, result) {
        if(err) {
            console.log(err);
            resp.send({
                status: "fail"
            });
        }
        
        if(result.rows.length == 1 && result.rows[0].is_admin == true) {
            var isMatch = bcrypt.compareSync(req.body.loginPassword, result.rows[0].password);
            if(isMatch) {
                req.session.user = result.rows[0];
                resp.send({
                    status: "success"
                });
            } else {
                resp.send({
                    status: "fail"
                });
            }
        } else {
            req.session.destroy();
            resp.send({
                status: "fail"
            });
        }
    });
});

// show clients
app.post("/showClients", function(req, resp) {
    client.query("SELECT * FROM users WHERE client_of = $1;", [req.session.user.user_id], function(err, result) {
        if(err) {
            console.log(err);
            resp.send({
                status: "fail"
            });
        }

        if(result.rows.length > 0) {
            resp.send({
                status: "success",
                clients: result.rows
            });
        } else {
            resp.send({
                status: "null"
            });
        }
    });
});

// register client from admin
app.post("/registerClient", function(req, resp) {
    client.query("SELECT * FROM users WHERE email = $1;", [req.body.regNewEmail], function(err, result) {
        if(err) {
            console.log(err);
            resp.send({
                status: "fail"
            });
        } else {
            if(result.rows.length == 0) {
                bcrypt.hash(req.body.regNewPassword, 5, function(err, bpass) {
                    client.query("INSERT INTO users (email, password, lname, fname, is_admin, client_of) VALUES ($1, $2, $3, $4, $5, $6) RETURNING lname, fname;",
                    [req.body.regNewEmail, bpass, req.body.regNewLname, req.body.regNewFname, false, req.session.user.user_id], function(err, result) {
                        if(err) {
                            console.log(err);
                            resp.send({
                                status: "fail"
                            });
                        } else {
                            resp.send({
                                status: "success",
                                fname: result.rows[0].fname,
                                lname: result.rows[0].lname
                            });
                        }
                    });
                });
            } else {
                resp.send({
                    status: "duplicate"
                });
            }
        }
    });
});

// delete client from admin
app.post("/deleteClient", function(req, resp) {
    client.query("DELETE FROM goals WHERE assigned_to = $1;", [req.body.clientIndex], function(err, result) {
        if(err) {
            console.log(err);
            resp.send({
                status: "fail"
            });
        } else {
            client.query("DELETE FROM users WHERE user_id = $1;", [req.body.clientIndex], function(err2, result2) {
                if(err2) {
                    console.log(err2);
                    resp.send({
                        status: "fail"
                    });
                } else {
                    resp.send({
                        status: "success"
                    });
                }
            });
        }
    });
});

// logout function for admin
app.post("/logout", function (req, resp) {
    req.session.destroy();
    resp.send({status: "success"});
});

// add a goal for a specific client
app.post("/taskMissed", function(req, resp) {
    client.query("UPDATE goals SET missed = true WHERE goal_id = $1", [req.body.goalId], function(err, result) {
        if(err) {
            console.log(err);
            resp.send({
                status: "fail"
            });
        } else {
            resp.send({
                status: "success"
            });
        }
    });
});

// add a goal for a specific client
app.post("/addGoal", function(req, resp) {
    client.query("INSERT INTO goals (title, assigned_to, assigned_by, description, due_date) values ($1, $2, $3, $4, $5)",
    [req.body.goalTitle, req.body.clientIndex, req.session.user.user_id,
    req.body.goalDescription, req.body.goalDueDate], function(err, result) {
        if(err) {
            console.log(err);
            resp.send({
                status: "fail"
            });
        } else {
            resp.send({
                status: "success"
            });
        }
    });
});

// get a specific client's goals
app.post("/getGoals", function(req, resp) {
    client.query("SELECT * FROM goals WHERE assigned_to = $1 order by finished_date;", [req.body.clientIndex], function(err, result) {
        if(err) {
            console.log(err);
            resp.send({
                status: "fail"
            });
        } else {
            if(result.rows.length > 0) {
                resp.send({
                    status: "success",
                    goals: result.rows
                });
            } else {
                resp.send({
                    status: "null"
                });
            }
        }
    });
});

// delete a specific unfinished goal for a client
app.post("/deleteGoal", function(req, resp) {
    client.query("DELETE FROM goals WHERE goal_id = $1;", [req.body.goalIndex], function(err, result) {
        if(err) {
            console.log(err);
            resp.send({
                status: "fail"
            });
        } else {
            resp.send({
                status: "success"
            });
        }
    });
});

// clear a specific finished or missed goal for a client
app.post("/clearGoal", function(req, resp) {
    client.query("UPDATE goals SET show = false WHERE goal_id = $1;", [req.body.clearIndex], function(err, result) {
        if(err) {
            console.log(err);
            resp.send({
                status: "fail"
            });
        } else {
            resp.send({
                status: "success"
            });
        }
    });
});

// server listen
server.listen(port, function(err) {
    if (err) {
        console.log(err);
        return false;
    }

    console.log("Running on port: " + port);
});