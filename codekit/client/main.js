var currentUserZuid = "";
var currentUserZgid = "";
var currentUserProfile = "";
currentUserDc = "";
var clientId = "1000.HT91PHQ08KCS1DPWMFN";


var isConnectorAuthorized = false;
var authUrl = "";

var package_name = "test_scaffolding_to_del_function";
var appName = "TestCRMScaffolding_";
var genericLink = window.location.origin;
var redirectLink = genericLink + "/server/" + package_name + "/authlogin/auth-success";


async function init() {
    var data = await ZOHO.CRM.CONFIG.GetCurrentEnvironment();
    var data2 = await ZOHO.CRM.CONFIG.getCurrentUser();


    currentUserZuid = data2.users[0].zuid;
    currentUserZgid = "" + data.zgid;

    //  console.log('currentUserZgid   ---------  ' + currentUserZgid);
    if (data.deployment == "EU") {
        currentUserDc = "eu";
    } else if (data.deployment == "IN") {
        currentUserDc = "in";
    } else if (data.deployment == "CN") {
        currentUserDc = "com.cn";
    } else if (data.deployment == "AU") {
        currentUserDc = "com.au";
    } else {
        currentUserDc = "com";
    }


    currentUserProfile = data2.users[0].profile.name;
    console.log('current user profile is  ' + currentUserProfile);
    console.log('zgid is  ' + currentUserZgid);

    var obj = { 'zuid': currentUserZuid, 'zgid': currentUserZgid, 'dc': currentUserDc };
    var url = genericLink + "/server/" + package_name + "/authlogin/setUserCookie"; //No I18N

    setUserCookieOnServer(obj, url);

    checkCookieAuthorizationAndLoadScreen();

    regenerateAuthURL();



}


function regenerateAuthURL() {
    console.log('in regenerateAuthURL ');
    var scope = "ZohoCRM.users.ALL,ZohoCRM.modules.all,ZohoProjects.projects.CREATE,ZohoProjects.portals.READ,ZohoSearch.securesearch.READ,Desk.settings.READ,Desk.basic.READ,Desk.tickets.CREATE,Desk.contacts.CREATE";
    //this authurl is used for loading the screen for permissions to access the crm data
    authUrl = "https://accounts.zoho." + currentUserDc + "/oauth/v2/auth?scope=" + scope + "&state=" + currentUserZuid + "-" + appName + "-" + currentUserZgid + "&client_id=" + clientId + "&env=ZohoCRM.1&response_type=code&access_type=offline&prompt=consent&redirect_uri=" + redirectLink;
    console.log(authUrl);
}



function setUserCookieOnServer(obj, url) {

    $.ajax({
        url: url,
        type: "POST", //No I18N
        data: JSON.stringify(obj),
        contentType: false, // NEEDED, DON'T OMIT THIS (requires jQuery 1.6+)
        processData: false, // NEEDED, DON'T OMIT THIS
        headers: { 'content-type': 'application/json' },
        success: function(data) {
            // console.log(JSON.stringify(data));
            console.log('success here');
        },
        error: function(data) {
            console.log(JSON.stringify(data));
        }
    });
}

function receiveMessage(e) {
    try {
        if (e.data.indexOf('Authorized') > -1 || e.data.indexOf('Authorized')) //No I18N
        {
            console.log('authorized');
            $("#authorize_ctr").val("Authorized."); //NO OUTPUTENCODING //No I18N
            isConnectorAuthorized = true;
        } else {
            console.log('not authorized');
        }
    } catch (err) {
        console.log('Error in receiveMessage   ' + err);
    }
}

function setConnectorAuthorizedCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = appName + cname + "=" + cvalue + ";" + expires + ";path=/;samesite=none;secure=true";
}

/**
 *
 * This method checks if the isConnectorAuthorized flag is set or not only
 *
 */
function checkCookieAuthorizationAndLoadScreen() {
    var cookieVal = getCookie("isConnectorAuthorized");

    if (cookieVal != undefined && cookieVal === "true") {
        isConnectorAuthorized = true;
        //    console.log('Show index.html');
        $('#authorizeDiv').hide();
        if (currentUserProfile != 'Administrator') {
            console.log('current user does not have Admin profile');
            //$('#home').hide();
            $('#home').html('You are not authorized to see the information');
        }
        $('#mainDiv').show();

    } else {
        //  console.log('cookieVal is undefined  so showing OAuth screen ');
        isConnectorAuthorized = false;
        $('#authorizeDiv').show();
        $('#mainDiv').hide();
    }
}



function getCookie(cname) {
    var name = appName + currentUserZuid + cname + "=";
    // console.log('in getCookie  ' + name);
    var ca = document.cookie.split(';');

    // console.log('ca is  ' + ca);
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        //match name
        if (c.indexOf(name) == 0) {
            //     console.log('substring is ' + c.substring(name.length, c.length));
            return c.substring(name.length, c.length);
        }
    }
    return false;
}

function getCookie4Revoke() {
    var name = appName;
    console.log('in getCookie4Revoke name is  ' + name);
    var ca = document.cookie.split(';');

    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        //  console.log('c is  --- ' + c);
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        //match name
        if (c.includes(name)) {
            var indexEqualTo = c.indexOf('=');
            var tempCookie = c.substring(0, indexEqualTo);
            //      console.log('substring is ' + tempCookie);
            return tempCookie;
        }
    }
    return false;
}


function revoke() {
    console.log(' in revoke  ');
    var cookie4deletion = getCookie4Revoke();
    //  console.log('cookie for deletion is   ' + cookie4deletion);
    delete_cookie(cookie4deletion);
    $('#revokeMessage').text("Please enable extension");

    $("#resultRevoke").text("Extension Revoked");
}


async function checkFormDetails() {
    console.log('in checkformdetails ');
    let data = {
        lastname: $('#t_lastname').val(),
        firstname: $('#t_firstname').val(),
        phone: $('#t_phone').val(),
        company: $('#t_company').val(),
        dc : currentUserDc

    };
    console.log(data);
    console.log(currentUserZgid);
    if (!validateData(data)) {
        return false;
    }


    try {

        result = await $.ajax({
            url: "/server/" + package_name + "/crm/createCRMLead",
            method: "post",
            dataType: 'text',
            data: {
                lastname: data.lastname,
                firstname: data.firstname,
                company: data.company,
                phone: data.phone,
                zgid: currentUserZgid,
                dc : data.dc

            },
            success: function(data) {
                // console.log(data);
                $("#dbStoreMessage").text("Lead Added Successfully");

            },
            error: function(error) {
                $("#dbStoreMessage").text(error);
                console.log("Error is " + error);
            }
        });


    } catch (e) {
        console.error(e);
    }
}

function validateData(data) {
    var regex = "[+][0-9]+$";
    if (data.lastname.length === 0) {
        alert('Last name cannot be empty');
        return false;
    }

    if (data.firstname.length === 0) {
        alert('First name cannot be empty');
        return false;
    }
    if (data.company.length === 0) {
        alert('Company cannot be empty');
        return false;
    }

    if (!data.phone.match(regex)) {
        alert('Enter a valid Phone number');
        return false;
    }

    return true;
}


function OnChangeDC(dropdown) {
    //    console.log('on chage invoked ');
    currentUserDc = $(dropdown).find(":selected").val();
    //   console.log('valSelected is     ' + valSelected);
    regenerateAuthURL();
};


async function getDC() {
    //   console.log('in getDC *********  ');
    var data = await ZOHO.CRM.CONFIG.GetCurrentEnvironment();
    if (data.deployment == "EU") {
        currentUserDc = "eu";
    } else if (data.deployment == "IN") {
        currentUserDc = "in";
    } else if (data.deployment == "CN") {
        currentUserDc = "com.cn";
    } else if (data.deployment == "AU") {
        currentUserDc = "com.au";
    } else {
        currentUserDc = "com";
    }
}




function showLoadingImage() {
    $('#callListTable tbody').append('<div id="loading-image"><img src="./images/loader.gif" alt="Loading..." /></div>');

}

function hideLoadingImage() {
    $('#loading-image').remove();

}


$('#formbutton').click(function() {
    checkFormDetails();
})


getDC();
