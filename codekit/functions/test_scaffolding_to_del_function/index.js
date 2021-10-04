const express = require("express");

const app = express();

var authlogin = require('./authlogin');
app.use('/authlogin', authlogin);


var crm = require('./crm');
app.use('/crm', crm);

//this is in case, there is some method that throws an error itself
app.use(function(error, req, res, next) {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });

});

module.exports = app;