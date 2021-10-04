const express = require('express');
var bodyParser = require("body-parser");
const catalyst = require("zcatalyst-sdk-node");
const superagent = require('superagent');
const cookieParser = require('cookie-parser');
const pwdenc = require('pwd-enc');
const config = require('./config');

var fullUrl = '';
var zuseridTemp;

var appName = config.app_Name;

const app = express();
global.__basedir = __dirname;

app.use(bodyParser.json());
app.use(cookieParser());

/***
 * This function gets the refresh token and decrypts the cookie and makes an insert to the db with the zuid, zgid and refresh token values
 *
 */
app.get('/auth-success', function(req, res) {
    //   console.log('in auth-success');
    var tempfullUrl = 'https://' + req.get('host');
    // console.log('tempfullUrl is  ' + tempfullUrl);
    var pos = tempfullUrl.indexOf(":443");
    fullUrl = tempfullUrl.substring(0, pos);

    console.log('fullUrl  with protocol is ++++++++++    ' + fullUrl);
    console.log('in auth-success ' + req.query.state);
    var stateTemp = req.query.state;

    zuseridTemp = stateTemp.split("-")[0];
    var appName = stateTemp.split("-")[1];
    var zgidTemp = stateTemp.split("-")[2];

    console.log('appName in auth-success is  ' + appName + "  -- zuiderTemp is  " + zuseridTemp + "  -- zgidTemp is  " + zgidTemp);


    try {
        const catalystApp = catalyst.initialize(req);
        var error = req.query.error;
        if (error === "access_denied") {
            console.log('access_denied');
            res.redirect('/server/' + config.package_name + '/authlogin/autherror?dataInfo=' + zuseridTemp + '-' + appName + '-' + zgidTemp);
        }
        var z_dc = req.query.location;
        var secret = config.ZOHO_CLIENT_SECRET;
        console.log("auth-success z_dc: " + z_dc);

        if (z_dc == "us") {
            z_dc = "com";
        } else if (z_dc == "cn") {
            z_dc = "com.cn";
        } else if (z_dc == "au") {
            z_dc = "com.au";
        }

        var tokenurl = config.ZOHO_CLIENT_URL_PREFIX + z_dc + config.ZOHO_CLIENT_REFRESH_URL;
        console.log(tokenurl);
        var grantToken = req.query.code;
        var z_refresh_token = "";
        console.log("auth-success grantToken: " + grantToken);

        var redirectTempURL = fullUrl + config.ZOHO_CLIENT_REDIRECT_URL;
        console.log('REDIRECT URL TEMP is ========>  ' + redirectTempURL);



        console.log("auth-success tokenurlfinal: " + tokenurl);


        superagent.post(tokenurl)
            .query({ code: grantToken, redirect_uri: redirectTempURL, client_id: config.ZOHO_CLIENT_ID, client_secret: config.ZOHO_CLIENT_SECRET, grant_type: 'authorization_code' })
            .end((errr, res1) => {
                console.log(res1.body);
                if (errr) {
                    console.log("error in auth-success" + errr);
                    return;
                }
                z_refresh_token = res1.body.refresh_token;
                console.log("auth-success z_refresh_token: " + z_refresh_token);

                var rowData = {};
                rowData[config.columnName1] = z_refresh_token;

                var decryptCookieIs = appName + zuseridTemp + '-' + zgidTemp + '-zjval';
                console.log('decryptCookieIs    ' + decryptCookieIs);
                var getDecryptCookieTemp = req.cookies[decryptCookieIs];
                console.log('decryptCookieTemp is >>>>   ' + getDecryptCookieTemp);
                var zjval = config.decrypt(getDecryptCookieTemp);
                console.log('auth-success post decrypt zjval is   ' + zjval);

                zjval = zjval.split(":");
                console.log("auth-success zjval: " + zjval);
                var zuid = zjval[0];
                var zgid = zjval[1];
                console.log("auth-success zuid: " + zuid + '  zgid ' + zgid + ' zrefreshtoken  ' + z_refresh_token);

                if ((zuid != undefined) && (zgid != undefined) && (z_refresh_token != undefined)) {
                    console.log('auth-success zuid and zgid are both not undefined. refreshtoken is not undefined');
                    rowData[config.columnName2] = zuid;
                    rowData[config.columnName3] = zgid;
                    rowData[config.columnName4] = z_dc;
                    var rowArr = [];
                    rowArr.push(rowData);


                    //

                    let zcql = catalystApp.zcql();
                    var queryHere = "select * from " + config.tableName + " where zuid =" + zuid;
                    console.log('queryHere is  ' + queryHere);
                    let zcqlPromise = zcql.executeZCQLQuery(queryHere);
                    zcqlPromise.then(queryResult => {
                        //        console.log(queryResult);
                        var rowCount = queryResult.length;
                        //  console.log('No. of Entries in  table is ------  ' + queryResult.length);
                        if (rowCount == 0) {
                            console.log('ROW INSERTED INTO OAUTHTOKENDETAILS TABLE ');
                            catalystApp.datastore().table(config.tableName).insertRows(rowArr).then(tokenInsertResp => {
                                console.log(tokenInsertResp);
                                console.log('inserted to datastore successfully');
                            }).catch(err11 => {
                                console.log("" + er11);
                            });
                        }
                        res.redirect('/server/' + config.package_name + '/authlogin/auth?dataInfo=' + zuid + '-' + appName + '-' + zgid);

                    });

                } else {
                    console.log(' --index.js--   Unable to get zuid');
                    res.send('<center>Unable to log you in </center>');
                }

            });

    } catch (mer1r) {
        console.log("Error here now in auth-success .... " + mer1r);

        return;
    }
});

app.get('/auth', function(req, res) {
    var tempInfo = req.query.dataInfo;
    console.log('tempInfo ' + tempInfo);
    res.redirect('/app/auth-success.html?dataInfo =' + tempInfo);
});

app.get('/autherror', function(req, res) {
    var tempInfo = req.query.dataInfo;
    console.log('tempInfo ' + tempInfo);
    res.redirect('/app/auth-error.html?dataInfo =' + tempInfo);
});

app.post('/setUserCookie', function(req, res) {

    var zuid = req.body.zuid;
    var zgid = req.body.zgid;
    var cookieCheck = config.app_Name + zuid + '-' + zgid + '-zjval';
    console.log('in setUserCookie  ......  cookieCheck is  ' + cookieCheck);
    // console.log(req.cookies.cookieCheck);
    console.log(req.cookies[cookieCheck]);

    // if ((zuid != undefined && zgid != undefined && req.cookies.cookieCheck == undefined)) {
    if ((zuid != undefined && zgid != undefined && req.cookies[cookieCheck] == undefined)) {

        console.log('cookie is not set yet ');
        var zjval = zuid + ":" + zgid
        console.log('zjval is  ' + zjval);
        zjval = encrypt(zjval);
        console.log('encrypted zjval is ' + zjval);
        var encryptCookieIs = appName + zuid + '-' + zgid + '-zjval';

        console.log('SETTING COOKIE NOW        ,   encryptCookieIs   ' + encryptCookieIs);

        //VERY IMPORTANT AS THIS IS THE NAME OF THE COOKIE
        res.cookie(encryptCookieIs, zjval, { expire: 31536000000 + Date.now(), sameSite: 'None', secure: true });
        res.json({ "status": "cookie set " });

    } else {
        console.log('cookie is already set in setUserCookie method ');
        res.json({ "status": "cookie already set perhaps" });
    }
});

function encrypt(text) {
    console.log('in encrypt  ' + text);
    text = pwdenc.EncryptPassword(text);
    return text;
}




module.exports = app;