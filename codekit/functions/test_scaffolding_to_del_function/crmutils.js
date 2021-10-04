var configuration = require('./config');
const axios = require('axios');
var FormData = require('form-data');

var configuration = require('./config');
const getAccessToken = async(catalystApp, zgid) => {
    console.log("CRMUTILS   ----  in getAccessToken method     " + zgid);

    if (zgid != undefined) {

        const connectorName = 'ZohoConnector_' + zgid;

        var result = await getDataFromCatalystDataStore(catalystApp, zgid, 'zgid');
        console.log('tokenDetails length is  ' + result.length);
        if (result.length > 0) {
            console.log('refresh_token          ...............  ' + result[0].OAuthTokenDetails.refresh_token);

            var connectorJson = {};
            var authUrl = configuration.ZOHO_CLIENT_URL_PREFIX + result[0].OAuthTokenDetails.dc + configuration.ZOHO_CLIENT_AUTH_URL;
            var refreshUrl = configuration.ZOHO_CLIENT_URL_PREFIX + result[0].OAuthTokenDetails.dc + configuration.ZOHO_CLIENT_REFRESH_URL;

            connectorJson[connectorName] = {
                client_id: configuration.ZOHO_CLIENT_ID,
                client_secret: configuration.ZOHO_CLIENT_SECRET,
                auth_url: authUrl,
                refresh_url: refreshUrl,
                refresh_token: result[0].OAuthTokenDetails.refresh_token
            }
            const connector = await catalystApp.connection(connectorJson).getConnector(connectorName);
            const accessToken = await connector.getAccessToken();


            return accessToken;
        } else {
            console.log('unable to get refresh token from db');
            return "Error in getting refresh token from DB";
        }


    } else {
        console.log('zgid is undefined');
        return "ZGID IS NOT DEFINED";
    }
}



async function getDataFromCatalystDataStore(catalystApp, zgid, columnName) {
    console.log('getDataFromCatalystDataStore  method ' + configuration.tableName + ' columnName is  ' + columnName + ' and value is    ' + zgid);
    // Queries the Catalyst Data Store table
    var queryString = "Select * from " + configuration.tableName + " where " + columnName + "=" + zgid;
    console.log(queryString);
    try {

        console.log(queryString);
        var result = await catalystApp.zcql().executeZCQLQuery(queryString);

        return result;
    } catch (e) {
        console.log(e);
    }

}






const createLeadInCRM = async(catalystApp, data, zgid, dc) => {

    console.log('in createLeadInCRM  ');
    console.log(data);
    var accessToken = await getAccessToken(catalystApp, zgid);
    console.log(accessToken);

    const reqBody = {
        data: [{
            "Last_Name": data.lastname,
            "First_Name": data.firstname,
            "Company": data.company,
            "Phone": data.phone
        }]
    };

    console.log('about to add Lead ------------------------------ ' + JSON.stringify(reqBody));
    var url = configuration.ZOHO_CRM_API_PREFIX + dc + configuration.ZOHO_CRM_GET_LEADS_API;

    console.log('URL TO UPDATE IS   -    ' + url);
    // console.log('about to add a Lead ------------------------------ ' + JSON.stringify(reqBody));
    //  var url = configuration.ZOHO_CRM_GET_LEADS_API;


    try {
        const response = await axios({
            method: 'post',
            url: url,
            headers: { "Authorization": "Zoho-oauthtoken " + accessToken, contentType: "application/json" },
            data: reqBody
        });
        console.log(response.data);



        await createZProject(catalystApp, data, zgid);
        await createTicket(catalystApp, data, zgid);
        return JSON.stringify(response.data);



    } catch (err_4) {
        //     console.log(err_4.response.data.error);
        console.log('Error4   ' + err_4);
        if (err_4.response && err_4.response.status == 401) {
            console.log('Error in creating Lead!');
        }
        if (err_4.response.status === 400) {
            console.log('400 error');
        }
        return "Error creating Lead";
    }
}


const createZProject = async(catalystApp, data, zgid) => {


    var accessToken = await getAccessToken(catalystApp, zgid);
    console.log(accessToken);

    var url = configuration.ZOHO_PROJECTS_API + '/portals/';

    try {
        const response = await axios({
            method: 'GET',
            url: url,
            headers: { "Authorization": "Zoho-oauthtoken " + accessToken, contentType: "application/json" }

        });
        var portalid = response.data.portals[0].id_string;
        console.log('portalid is  ' + portalid);

        var bodyFormData = new FormData();
        bodyFormData.append('name', 'TestScaffoldProject');

        var url_create_project = configuration.ZOHO_PROJECTS_API + '/portal/' + portalid + '/projects/';
        console.log(url_create_project);


        //be careful as one has to handle boundary here
        const create_project_response = await axios({
            method: 'POST',
            url: url_create_project,
            data: bodyFormData,
            headers: { "Authorization": "Zoho-oauthtoken " + accessToken, 'Content-Type': `multipart/form-data; boundary=${bodyFormData._boundary}` }

        });
        console.log(create_project_response.data);
        return JSON.stringify(create_project_response.data);
    } catch (err_4) {
        console.log('Error4   ' + err_4);
        if (err_4.response && err_4.response.status == 401) {
            console.log('Error in creating Lead!');
        } else if (err_4.response.status === 400) {
            console.log('400 error');
        }
        return "Error creating entity";
    }
}



const createTicket = async(catalystApp, data, zgid) => {


    var accessToken = await getAccessToken(catalystApp, zgid);
    console.log(accessToken);


    var url = configuration.ZOHO_DESK_API + '/api/v1/departments';

    console.log('about to get departments ------------ ' + url);

    try {
        const response = await axios({
            method: 'GET',
            url: url,
            headers: { "Authorization": "Zoho-oauthtoken " + accessToken, contentType: "application/json" }

        });
        //  console.log(response.data.data[0]);

        var dept_id = response.data.data[0].id;
        console.log('department id is  ' + dept_id);

        //now create a contact
        var url_create_desk_contact = configuration.ZOHO_DESK_API + '/api/v1/contacts';
        console.log(url_create_desk_contact);

        var contact_body = {
            "lastName": "tester",
            "firstName": "scaffold"
        }

        const create_contact_response = await axios({
            method: 'POST',
            url: url_create_desk_contact,
            data: contact_body,
            headers: { "Authorization": "Zoho-oauthtoken " + accessToken }
        });
        console.log(create_contact_response.data);
        var contact_id = create_contact_response.data.id;
        console.log('contactId is ' + contact_id);

        //now using the contactid, create a ticket
        var url_create_ticket = configuration.ZOHO_DESK_API + '/api/v1/tickets';
        console.log(url_create_ticket);

        var ticket_body = {
                "subject": "Test Ticket from Scaffolding",
                "departmentId": dept_id,
                "contactId": contact_id
            }
            //be careful as one has to handle boundary here
        const create_ticket_response = await axios({
            method: 'POST',
            url: url_create_ticket,
            data: ticket_body,
            headers: { "Authorization": "Zoho-oauthtoken " + accessToken }

        });
        console.log(create_ticket_response.data);
        return JSON.stringify(create_ticket_response.data);

    } catch (err_4) {
        //     console.log(err_4.response.data.error);
        console.log('Error4   ' + err_4);
        if (err_4.response && err_4.response.status == 401) {
            console.log('Error in creating Lead!');
        }
        if (err_4.response.status === 400) {
            console.log('400 error');
        }
        return "Error creating Lead";
    }


}
exports.getAccessToken = getAccessToken;

exports.createLeadInCRM = createLeadInCRM;