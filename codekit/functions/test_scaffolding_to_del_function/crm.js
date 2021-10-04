const express = require("express");
const crmutils = require('./crmutils.js');

const catalyst = require("zcatalyst-sdk-node");
var bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.post('/createCRMLead', async(req, res) => {
    const catalystApp = catalyst.initialize(req);
    console.log('in addlead ' + JSON.stringify(req.body));
    var zgid = req.body.zgid;
    var data = req.body;
    if (zgid == null || zgid == 'undefined') {
        res.send("Missing info, not able to update the DB");
        return;
    }
    var dc = req.body.dc;
    console.log('dc is ' + dc);
    if (dc == null || dc == 'undefined') {
        res.send("Missing info, not able to update the DB");
        return;
    }
    try {


        var response = await crmutils.createLeadInCRM(catalystApp, data, zgid, dc);
        if (response.indexOf("Error") > -1) {
            res.send('Error updating Lead');
            return;
        } else {
            res.send(JSON.stringify(response));
        }

    } catch (e) {
        res.send("Error in updating CRM");
        console.error(e);
    }
})

module.exports = app;