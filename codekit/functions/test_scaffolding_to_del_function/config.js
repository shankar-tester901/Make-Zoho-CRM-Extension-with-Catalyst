const pwdenc = require('pwd-enc');

const package_name = 'test_scaffolding_to_del_function';
const app_Name = 'TestCRMScaffolding_';
const ZOHO_CLIENT_ID = "1000.HN7T91PHQ08KCS1DPWMFN";
const ZOHO_CLIENT_SECRET = "84ffed31bf66ce64a2c136ed6d66938";

const ZOHO_CLIENT_URL_PREFIX = "https://accounts.zoho.";
const ZOHO_CLIENT_AUTH_URL = "/oauth/v2/auth";
const ZOHO_CLIENT_REFRESH_URL = "/oauth/v2/token";
const ZOHO_CLIENT_REDIRECT_URL = "/server/" + package_name + "/authlogin/auth-success";

const ZOHO_CRM_API_PREFIX = "https://www.zohoapis.";
const ZOHO_CRM_USERS_API = "/crm/v2/users";
const ZOHO_CRM_GET_LEADS_API = "/crm/v2/Leads";

//const ZOHO_CRM_GET_LEADS_API = "https://www.zohoapis.com/crm/v2/Leads";
const ZOHO_PROJECTS_API = "https://projectsapi.zoho.com/restapi";
const ZOHO_DESK_API = "https://desk.zoho.com";


const tableName = 'OAuthTokenDetails'; // The table created in the Data Store

const columnName1 = 'refresh_token'; // The column 1 created in the table
const columnName2 = 'zuid'; // The column 2 created in the table
const columnName3 = 'zgid'; // The column 2 created in the table
const columnName4 = 'dc'; // The column 4 created in the table



function encrypt(text) {
    console.log(' in encrypt ---------   ' + text);

    text = pwdenc.EncryptPassword(text);
    return text;
}


function decrypt(text) {
    console.log(' in decrypt ---------   ' + text);
    text = pwdenc.DecryptPassword(text);
    return text;
}




exports.ZOHO_CLIENT_ID = ZOHO_CLIENT_ID;
exports.ZOHO_CLIENT_SECRET = ZOHO_CLIENT_SECRET;
exports.ZOHO_CLIENT_REDIRECT_URL = ZOHO_CLIENT_REDIRECT_URL;
exports.ZOHO_CLIENT_AUTH_URL = ZOHO_CLIENT_AUTH_URL;
exports.ZOHO_CLIENT_REFRESH_URL = ZOHO_CLIENT_REFRESH_URL;
exports.ZOHO_CRM_API_PREFIX = ZOHO_CRM_API_PREFIX;

exports.ZOHO_CLIENT_URL_PREFIX = ZOHO_CLIENT_URL_PREFIX;
exports.ZOHO_CRM_USERS_API = ZOHO_CRM_USERS_API;

exports.ZOHO_CRM_GET_LEADS_API = ZOHO_CRM_GET_LEADS_API;
exports.ZOHO_PROJECTS_API = ZOHO_PROJECTS_API;
exports.ZOHO_DESK_API = ZOHO_DESK_API;


exports.tableName = tableName;
exports.columnName1 = columnName1;
exports.columnName2 = columnName2;
exports.columnName3 = columnName3;
exports.columnName4 = columnName4;

exports.decrypt = decrypt;
exports.encrypt = encrypt;

exports.package_name = package_name;
exports.app_Name = app_Name;
