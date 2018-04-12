const webpack = require("webpack");
const path = require("path");

var jF = path.resolve(__dirname,"js");
var bF = path.resolve(__dirname,"build");

var config = {
    entry: {
        "login": jF + "/login.js",
        "admin": jF + "/admin.js",
        "client": jF + "/client.js",
        "register": jF + "/register.js"
    },
    output: {
        filename: "[name]bundle.js",
        path: bF,
    },
    plugins: [
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery",
        })
    ],
}

module.exports = config