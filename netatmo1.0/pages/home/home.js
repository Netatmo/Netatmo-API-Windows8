/// THIS CODE AND INFORMATION IS PROVIDED "AS IS" WITHOUT WARRANTY OF 
//// ANY KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO 
//// THE IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A 
//// PARTICULAR PURPOSE. 
//// 

(function () {
    "use strict";

    WinJS.UI.Pages.define("/pages/home/home.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            // TODO: Initialize the page here.


            document.getElementById("connect").addEventListener("click", Netatmo_Init_Reading, false);
        }
    });


    ///////// initiate & read data from an existing Netatmo device
    function Netatmo_Init_Reading() {

        var clientID = "50bf37f6*******";                      // <--- Add your ouath client ID here (from https://dev.netatmo.com/dev/listapps)
        var clientSecret = "PrzystYWj5*******";    // <--- Add your ouath client secret here (from https://dev.netatmo.com/dev/listapps)


        var username = document.getElementById("email").value;      // Entered by user
        var password = document.getElementById("password").value;   // Entered by user

        Netatmo_Authenticate_method1(clientID, clientSecret, username, password);

    }




    //// OAUTH Method 1 : Client Credentials
    function Netatmo_Authenticate_method1(clientID, clientSecret, username, password) {

        var token;
        var token_expire_in;
        var refresh_token;


        // format the parameters
        var params = "grant_type=password";
        params += "&client_id=" + clientID;
        params += "&client_secret=" + clientSecret;
        params += "&username=" + username;
        params += "&password=" + password;


        WinJS.xhr({
            type: "POST",
            url: "https://api.netatmo.net/oauth2/token",
            headers: { "Content-type": "application/x-www-form-urlencoded;charset=UTF-8" },
            data: params
        }).done(
       function complete(request) {
           var obtainedData = window.JSON.parse(request.responseText);

           token = obtainedData.access_token;
           token_expire_in = obtainedData.expire_in;
           refresh_token = obtainedData.refresh_token;


           //Get a measure once authenticated
           Netatmo_Getdevicelist(token);



       },
       function error(request) {
           token = "";
           token_expire_in = 0;
           refresh_token = "";

           Windows.UI.Popups.MessageDialog("Cannot get a token", "Error").showAsync();

           return false;
       },
       function progress(request) {
           // report on progress of download.

       }


   );

    }


    //// Get a the list of devices
    function Netatmo_Getdevicelist(token) {

        var url = "https://api.netatmo.net/api/devicelist?access_token=" + token;

        WinJS.xhr({ url: url, responseType: "json" }
        ).done(
       function complete(result) {
           var fullcontent = window.JSON.parse(result.responseText);

           // As an example, get the first Device_id from the returned list
           // See Private API format for more details 
           var device_id = fullcontent.body.devices[0]._id;

           // Get measure points from the device        
           Netatmo_Getmeasure(token, device_id)

       },
       function error(result) {
           //  report error
           Windows.UI.Popups.MessageDialog("No device detected", "Error").showAsync();
       },
       function progress(request) {
           // report on progress of download.
       }

      );

    }


    // Get measure point from a device
    function Netatmo_Getmeasure(token, device_id) {
        var url = "https://api.netatmo.net/api/getmeasure?access_token=" + token + "&device_id=" + device_id;


        // As an example, get the lastest  Temperature & Humidity
        // See Private API format for more details & formats
        url += "&type=Temperature,Humidity&limit=1&date_end=last&scale=30min";


        WinJS.xhr({ url: url, responseType: "json" }
        ).done(
       function complete(result) {
           var fullcontent = window.JSON.parse(result.responseText);

           var temperature = fullcontent.body[0].value[0][0]; // indoor temperature
           var humidity = fullcontent.body[0].value[0][1];    // indoor humidity


           document.getElementById("temperature_indoor").innerHTML = "Temp.: " + temperature + "°C";
           document.getElementById("humidity").innerHTML = "Humidity: " + humidity + " %";

       },
       function error(result) {
           //  report error
           Windows.UI.Popups.MessageDialog("Cannot retrieve data from the device", "Error").showAsync();
       },
       function progress(request) {
           // report on progress of download.
       }

      );
    }





})();
