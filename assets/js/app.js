// firebase connection
var config = {
    apiKey: "AIzaSyBrINciYykzgm93-J0NsRSLADGwsjUQREU",
    authDomain: "moodu-c5856.firebaseapp.com",
    databaseURL: "https://moodu-c5856.firebaseio.com",
    storageBucket: "moodu-c5856.appspot.com",
    messagingSenderId: "461647702901"
};

firebase.initializeApp(config);

//Handle Account Status
firebase.auth().onAuthStateChanged(user => {
    if (!user) {
        window.location = 'index.html'; //If User is not logged in, redirect to login page
    }
});

// Logout function
$('#logoutNow').on('click', function(event) {
    event.preventDefault();
    firebase.auth().signOut().then(function() {
        // Sign-out successful.
    }).catch(function(error) {
        // An error happened.
    });
});


$('#beginApp').on('click', function(event) {
    event.preventDefault();
    $('.bear-message').fadeOut('fast');
    $('.app').delay(500).fadeIn('slow');
    $('.moodu-bear-container').animate({
        left: '20px',
        top: '10%',
        width: '100px',
        margin: '0'
    }, 500);


});

// References to all "take-photo" elements
var video = document.querySelector('#camera-stream'),
    image = document.querySelector('#snap'),
    start_camera = document.querySelector('#start-camera'),
    controls = document.querySelector('.controls'),
    take_photo_btn = document.querySelector('#take-photo'),
    delete_photo_btn = document.querySelector('#delete-photo'),
    download_photo_btn = document.querySelector('#download-photo'),
    error_message = document.querySelector('#error-message'),
    selfie,
    database = firebase.database(),
    spotifyCategory;


// The getUserMedia interface is used for handling camera input.
// Some browsers need a prefix so here we're covering all the options
navigator.getMedia = (navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia ||
    navigator.oGetUserMedia);


if (!navigator.getMedia) {
    displayErrorMessage("Your browser doesn't have support for the navigator.getUserMedia interface.");
} else {

    // Request the camera.
    navigator.getMedia({
            video: true
        },
        // Success Callback
        function(stream) {

            // Create an object URL for the video stream and
            // set it as src of our HTLM video element.
            video.src = window.URL.createObjectURL(stream);

            // Play the video element to start the stream.
            video.play();
            video.onplay = function() {
                showVideo();
            };
        },
        // Error Callback
        function(err) {
            displayErrorMessage("There was an error with accessing the camera stream: " + err.name, err);
        }
    );

}

// Mobile browsers cannot play video without user input,
// so here we're using a button to start it manually.
start_camera.addEventListener("click", function(e) {

    e.preventDefault();

    // Start video playback manually.
    video.play();
    showVideo();
    // Displays photo tip/advice on how to get best results
    $('.overlay-advice').delay(500).fadeIn('slow').delay(1500).fadeOut('slow');
});

// take photo button function
take_photo_btn.addEventListener("click", function(e) {

    e.preventDefault();

    var snap = takeSnapshot();

    // Show image. 
    image.setAttribute('src', snap);
    image.classList.add("visible");

    // Enable delete and save buttons
    delete_photo_btn.classList.remove("disabled");
    download_photo_btn.classList.remove("disabled");

    // Set the href attribute of the download button to the snap url.
    // download_photo_btn.href = snap;

    // Pause video playback of stream.
    video.pause();

});

download_photo_btn.addEventListener("click", function(e) {

    var user = firebase.auth().currentUser;
    var uid = user.uid;

    var snap = takeSnapshot();
    var blob = dataURItoBlob(snap);

    // Create a root reference
    var storageRef = firebase.storage().ref();

    // Initial UID for images
    var selfieID = 0;

    // Create a reference to 'mountains.jpg'
    var selfieRef = storageRef.child(uid + '-' + selfieID++ + '.png');

    // Create a reference to 'images/mountains.jpg'
    var selfieImagesRef = storageRef.child('/selfies/' + uid + '-' + selfieID++ + '.png');

    // While the file names are the same, the references point to different files
    selfieRef.name === selfieImagesRef.name; // true
    selfieRef.fullPath === selfieImagesRef.fullPath; // false

    var uploadTask = selfieImagesRef.put(blob); // Puts image in firebase storage reference

    //------------------------------ AJAX Post to Microsoft Cognitive Service, Emotion API ------------------------------//
    // Get download URL
    var handlesImgSaved = selfieImagesRef.getDownloadURL();

    // `url` is the download URL for 'images/stars.jpg'
    //apiKey: Replace this with your own Project Oxford Emotion API key, please do not use my key. I include it here so you can get up and running quickly but you can get your own key for free at https://www.projectoxford.ai/emotion 
    var apiKey = "f8c966943aa0419ea6b294f135365d95";

    //apiUrl: The base URL for the API. Find out what this is for other APIs via the API documentation
    var apiUrl = "https://api.projectoxford.ai/emotion/v1.0/recognize";

    // redeclaring blob as file
    var file = blob;

    callAPI(file, apiUrl, apiKey);

    function callAPI(file, apiUrl, apiKey) {
        $.ajax({
            url: apiUrl,
            beforeSend: function(xhrObj) {
                xhrObj.setRequestHeader("Content-Type", "application/octet-stream");
                xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", apiKey);
            },
            type: "POST",
            data: file,
            processData: false
        }).done(function(response) {
            processResult(response);
        }).fail(function(error) {
            $("#response").text(error.getAllResponseHeaders());
            $("#preloader").fadeOut();
            $("errorRetake").fadeIn();
        });
    }

});

//adjust height of appContainer to fit box of content options
$('#contentOptions').on('click', function() {
    var biggestHeight = "0";
    if ($(this).parents('.box').next('.box').height() > biggestHeight) {
        biggestHeight = $(this).parents('.box').next('.box').height();
    }
    var totHeight = biggestHeight + 100;
    $("#appContainer").height(totHeight).css('margin-bottom', '150px');
    $("#restartFromOptions").animate({ top: "0px" });
});

// animate steps on next
$('.next-step').click(function() {
    $(this).parents(".box").animate({ left: '-150%' }, 500);
    $(this).parents(".box").next(".box").animate({ left: '50%' }, 500);
});
// animate steps on back
$('.back-step').click(function() {
    $("#appContainer").css('margin-bottom', '0').css('height', '100%');
    $(this).parents(".box").animate({ left: '150%' }, 500);
    $(this).parents(".box").prev(".box").animate({ left: '50%' }, 500);
    $(this).parents(".box").children("#areYouFeeling").css('display', 'none');
    $('#youAreFeeling').empty();
    $('#errorRetake').hide();
    // reset camera
    image.setAttribute('src', "");
    image.classList.remove("visible");
    // Disable delete and save buttons
    delete_photo_btn.classList.add("disabled");
    download_photo_btn.classList.add("disabled");
    // Resume playback of stream.
    video.play();
});
// restart from content options screen
$('#restartFromOptions').click(function() {
    $("#appContainer").css('margin-bottom', '0').css('height', '100%');
    $(this).parents(".box").animate({ left: '300%' }, 500);
    $(this).animate({ top: "-150px" });
    $(this).parents(".box").prev(".box").css('left', '150%');
    $(this).parents(".box").prev(".box").children("#areYouFeeling").css('display', 'none');
    $(this).parents(".box").prev(".box").prev(".box").animate({ left: '50%' }, 500);
    $('#youAreFeeling').empty();
    // reset camera
    image.setAttribute('src', "");
    image.classList.remove("visible");
    // Disable delete and save buttons
    delete_photo_btn.classList.add("disabled");
    download_photo_btn.classList.add("disabled");
    // Resume playback of stream.
    video.play();
});
// restart from content screen
$('#goBackFromContent').click(function() {
    $("#appContainer").css('margin-bottom', '0').css('height', '100%');
    $(this).parents(".box").animate({ left: '450%' }, 500);
    $(this).parents(".box").prev(".box").animate({ left: '50%' }, 500);
    $(this).animate({ top: "-150px" });
    $("#restartFromOptions").animate({ top: '0' });
    $('#youAreFeeling').empty();
    $("#trails").empty();
    $("#random-quotes").empty();
    $("#groupon").empty();

    // reset camera
    image.setAttribute('src', "");
    image.classList.remove("visible");
    // Disable delete and save buttons
    delete_photo_btn.classList.add("disabled");
    download_photo_btn.classList.add("disabled");
    // Resume playback of stream.
    video.play();
});

$('.deliver-content').click(function() {
    $("#restartFromOptions").animate({ top: "-150px" });
    $("#goBackFromContent").animate({ top: "0px" });
});

// delete photo button on camera
delete_photo_btn.addEventListener("click", function(e) {

    e.preventDefault();

    // Hide image.
    image.setAttribute('src', "");
    image.classList.remove("visible");

    // Disable delete and save buttons
    delete_photo_btn.classList.add("disabled");
    download_photo_btn.classList.add("disabled");

    // Resume playback of stream.
    video.play();

});

function showVideo() {
    // Display the video stream and the controls.

    hideUI();
    video.classList.add("visible");
    controls.classList.add("visible");
}

function takeSnapshot() {
    // Here we're using a trick that involves a hidden canvas element.  

    var hidden_canvas = document.querySelector('canvas'),
        context = hidden_canvas.getContext('2d');

    var width = video.videoWidth,
        height = video.videoHeight;

    if (width && height) {

        // Setup a canvas with the same dimensions as the video.
        hidden_canvas.width = width;
        hidden_canvas.height = height;

        // Make a copy of the current frame in the video on the canvas.
        context.drawImage(video, 0, 0, width, height);

        // Turn the canvas image into a dataURL that can be used as a src for our photo.
        return hidden_canvas.toDataURL('image/png');
    }
}


function displayErrorMessage(error_msg, error) {
    error = error || "";
    if (error) {
        console.log(error);
    }

    error_message.innerText = error_msg;

    hideUI();
    error_message.classList.add("visible");
};


function hideUI() {
    // Helper function for clearing the app UI.

    controls.classList.remove("visible");
    start_camera.classList.remove("visible");
    video.classList.remove("visible");
    snap.classList.remove("visible");
    error_message.classList.remove("visible");
};


function dataURItoBlob(dataURI) {
    // convert base64/URLEncoded data component to raw binary data held in a string
    var byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0)
        byteString = atob(dataURI.split(',')[1]);
    else
        byteString = unescape(dataURI.split(',')[1]);

    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to a typed array
    var ia = new Uint8Array(byteString.length);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    // Returns the blob
    return new Blob([ia], { type: mimeString });
};

// Process microsoft cognitive API results to give users emotional analytics feedback
function processResult(response) {
    var data = JSON.stringify(response);
    console.log(response[0]);

    var feelingMeasures = [response[0].scores.happiness, response[0].scores.anger, response[0].scores.disgust, response[0].scores.neutral, response[0].scores.surprise, response[0].scores.fear, response[0].scores.sadness];

    // iterate through feeling measures to only include 7 decimal places for each feeling's measurement
    var x = 0;
    var len = feelingMeasures.length
    while (x < len) {
        feelingMeasures[x] = feelingMeasures[x].toFixed(7);
        x++
    }

    // find max in the array of feelings
    var max = Math.max(...feelingMeasures);
    // console.log(feelingMeasures);

    // console.log(max);
    // asks user if the emotion is correct
    if (feelingMeasures[0] == max) {
        spotifyCategory = "workout";
        $('#areYouFeeling').fadeIn();
        return $('#youAreFeeling').hide().html('You Seem Happy!! Are You?').fadeIn();
    }
    if (feelingMeasures[1] == max) {
        spotifyCategory = "rock";
        $('#areYouFeeling').fadeIn();
        return $('#youAreFeeling').hide().html('You Seem Angry. Are You?').fadeIn();
    }
    if (feelingMeasures[2] == max) {
        spotifyCategory = "metal";
        $('#areYouFeeling').fadeIn();
        return $('#youAreFeeling').hide().html('You Seem Disgusted. Are You?').fadeIn();
    }
    if (feelingMeasures[3] == max) {
        spotifyCategory = "toplists";
        $('#areYouFeeling').fadeIn();
        return $('#youAreFeeling').hide().html('Do you feel neutral? Mixed emotions possibly?').fadeIn();
    }
    if (feelingMeasures[4] == max) {
        spotifyCategory = "dance";
        $('#areYouFeeling').fadeIn();
        return $('#youAreFeeling').hide().html("You look surprised? Are you goofin' around?").fadeIn();
    }
    if (feelingMeasures[5] == max) {
        spotifyCategory = "focus";
        $('#areYouFeeling').fadeIn();
        return $('#youAreFeeling').hide().html("AHHH! You seem scared, it's sorta' creepy. Do you feel fearful?").fadeIn();
    }
    if (feelingMeasures[6] == max) {
        spotifyCategory = "country";
        $('#areYouFeeling').fadeIn();
        return $('#youAreFeeling').hide().html('You look bothersome. Are you sad or something?').fadeIn();
    }
};

// ajax preloader start & stop for emotion api
$(document).ready(function() {
    $(document).ajaxStart(function() {
        $('#preloader').show();
    }).ajaxStop(function() {
        $('#preloader').hide();
    });
});

//------------------ Spotify API ------------------//
$("#listenMusic").on("click", function(event) {
    // Preventing the button from trying to submit the form
    event.preventDefault();

    // console.log("hi");
    var categoryURL = "https://api.spotify.com/v1/browse/categories/" + spotifyCategory + "/playlists";
    console.log(spotifyCategory)
    $.ajax({
        url: categoryURL,
        dataType: 'json',
        headers: {
            "Authorization": "Bearer BQDKa4sf-Xg7_V_JI_Hacv-FxZujlsjsBwQt5TAWlYI4sJZl3_T1jCU_Y_AF_cLIRIM1Dftem2xuPkAKd3MwU4kmbkaqrpaQWQQJ7NAjN4Z2jEF-FWclPImXAGhIB-lwqP52KJB29g7LuNlOhA3w-sx6-MJD_d6R1JHzHRMC2l2Oj0VlWPUeEnRZ5vAMou4UhCf0SV71EKVEgc41aiKAfD20JqH3F0bwVJMPS0j-dLok661dhAqwJUdNvCT2PaQPKXTXnmfZPCSpKYk8NqxosJGByuHm8hZsPAkEhIGc3OlyWYtP"
        },
        method: "GET",
        global: false
    }).done(function(categoryResponse) {
        console.log(categoryResponse);
        playList = categoryResponse.playlists.items["0"].id;
        var user_id = categoryResponse.playlists.items["0"].owner.id;

        var playListURL = "https://api.spotify.com/v1/users/" + user_id + "/playlists/" + playList;
        console.log(playListURL);

        $.ajax({
            url: playListURL,
            dataType: 'json',
            headers: {
                "Authorization": "Bearer BQDKa4sf-Xg7_V_JI_Hacv-FxZujlsjsBwQt5TAWlYI4sJZl3_T1jCU_Y_AF_cLIRIM1Dftem2xuPkAKd3MwU4kmbkaqrpaQWQQJ7NAjN4Z2jEF-FWclPImXAGhIB-lwqP52KJB29g7LuNlOhA3w-sx6-MJD_d6R1JHzHRMC2l2Oj0VlWPUeEnRZ5vAMou4UhCf0SV71EKVEgc41aiKAfD20JqH3F0bwVJMPS0j-dLok661dhAqwJUdNvCT2PaQPKXTXnmfZPCSpKYk8NqxosJGByuHm8hZsPAkEhIGc3OlyWYtP"
            },
            method: "GET",
            global: false
        }).done(function(playlistResponse) {
            console.log(playlistResponse);

            var trackId = playlistResponse.tracks.items["1"].track.id;
            // need to figure out how to use this iframe - work with group on thursday!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            var playlistiFrame = '<iframe src="https://embed.spotify.com/?uri=spotify:' + playList + '%3A2PXdUld4Ueio2pHcB6sM8j&theme=white" width="300" height="380" frameborder="0" allowtransparency="true"></iframe>';
            var player = "<iframe src='https://embed.spotify.com/?uri=spotify:track:" +
                trackId + "' frameborder='0' allowtransparency='true'></iframe>";
            // Appending the new player into the HTML
            $("#playerDiv").append(playlistiFrame);
            $('#result-template').fadeIn('slow');
        });
    });
    // logs a user in to spotify
    (function() {

        function login(callback) {
            var CLIENT_ID = '1fac33a31ac94dcf81404925a1a9fdcd';
            var REDIRECT_URI = 'https://mikelearning91.github.io/spot-proxy.html';

            function getLoginURL(scopes) {
                return 'https://accounts.spotify.com/authorize?client_id=' + CLIENT_ID +
                    '&redirect_uri=' + encodeURIComponent(REDIRECT_URI) +
                    '&scope=' + encodeURIComponent(scopes.join(' ')) +
                    '&response_type=token';
            }

            var url = getLoginURL([
                'user-read-email'
            ]);

            var width = 450,
                height = 730,
                left = (screen.width / 2) - (width / 2),
                top = (screen.height / 2) - (height / 2);

            window.addEventListener("message", function(event) {
                var hash = JSON.parse(event.data);
                if (hash.type == 'access_token') {
                    callback(hash.access_token);
                }
            }, false);

            var w = window.open(url,
                'Spotify',
                'menubar=no,location=no,resizable=no,scrollbars=no,status=no, width=' + width + ', height=' + height + ', top=' + top + ', left=' + left
            );

        }

        function getUserData(accessToken) {
            return $.ajax({
                url: 'https://api.spotify.com/v1/me',
                headers: {
                    'Authorization': 'Bearer ' + accessToken
                }
            });
        }

        var templateSource = document.getElementById('result-template').innerHTML,
            template = Handlebars.compile(templateSource),
            resultsPlaceholder = document.getElementById('result'),
            loginButton = document.getElementById('btn-login');

        loginButton.addEventListener('click', function() {
            login(function(accessToken) {
                getUserData(accessToken)
                    .then(function(response) {
                        loginButton.style.display = 'none';
                        resultsPlaceholder.innerHTML = template(response);
                    });
            });
        });

    })();
});

// Trails API if interest hiking is checked in profile
firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        var user = firebase.auth().currentUser;
        var userId = user.uid;
        firebase.database().ref('temp/users/' + userId).on('value', function(snapshot) {
            var hikingTrue = snapshot.val().hiking;
            console.log(hikingTrue);
            if (hikingTrue === "hiking") {
                $('.hiking-card').show();
            } else {
                $('.hiking-card').hide();
            }
        });
    }
});

var trailsUrl = 'https://trailapi-trailapi.p.mashape.com/?lat=34.1&lon=-105.2&q[activities_activity_type_name_eq]=hiking&radius=50';
var longitude;
var latitude;
$('#getTrails').on('click', function() {
    $.ajax({
        url: trailsUrl,
        dataType: 'JSON',
        headers: {
            'X-Mashape-Key': 'rXe4JWi3fImshsUjJwP4gQhzkBFDp1XOF1HjsntrFYaYzWaaYs'
        },
        type: "GET",
        global: false
    }).done(function(response) {
        console.log(response);
        var trailsResponse = response.places;
        for (var k = 0; k < trailsResponse.length; k++) {
            var trailInfo = $('<div class="trail-info">').fadeIn();
            trailInfo.append('<img class="trail-image-holder" width="75" height="75" src="assets/images/trail.png">').fadeIn();
            trailInfo.append('<h3 class="trail-name">' + trailsResponse[k].name + '</h3>').fadeIn();
            trailInfo.append('<h4 class="trail-city">' + trailsResponse[k].city + '</h4>').fadeIn();
            trailInfo.append('<p class="trail-des">' + trailsResponse[k].description + '</p>').fadeIn();
            trailInfo.append('<button class="btn btn-success trail-link"><a target="_blank" title="Trail Info" href="' + trailsResponse[k].activities["0"].url + '">Go To Trail</a></button>').fadeIn();

            $('#trails').append(trailInfo);
            $('#trails').fadeIn('slow');

            var adjustedHeight = "0";
            if ($('#trails').parents('.box').height() > adjustedHeight) {
                adjustedHeight = $('#trails').parents('.box').height();
            }
            moreHeight = adjustedHeight + 50;
            $("#appContainer").height(moreHeight).css('margin-bottom', '150px');
        }
    }).fail(function(error) {
        console.log(error);
    });

});

// Random Quote API

$('.first-quote').on('click', function() {
    var quoteUrl = 'https://quotes.rest/quote/random';
    $.ajax({
        headers: {
            "Accept": "application/json",
            "X-TheySaidSo-Api-Secret": "AT6ONGFY2IWNpQRVwpbuuAeF"
        },
        url: quoteUrl,
        global: false,
        success: function(response) {
            console.log(response);

            var quotesContainer = $("#random-quotes");
            if (response.contents.author == "") {
                quotesContainer.append('<h3 class="quote">' + response.contents.quote + '</h3>')
                quotesContainer.append('<p class="author">- Unkown Author</p>')
                quotesContainer.append('<button class="btn btn-lg btn-warning new-quote">Get Another Quote</button>')
                $("#random-quotes").fadeIn();
            } else {
                quotesContainer.append('<h3 class="quote">' + response.contents.quote + '</h3>')
                quotesContainer.append('<p class="author">---' + response.contents.author + '</p>')
                quotesContainer.append('<button id="new-quote" onClick="newQuote();" class="btn btn-lg btn-success">Get Another Quote</button>')
                $("#random-quotes").fadeIn();
            }
            var adjustedHeight = "0";
            if ($('#random-quotes').parents('.box').height() > adjustedHeight) {
                adjustedHeight = $('#trails').parents('.box').height();
            }
            moreHeight = adjustedHeight + 50;
            $("#appContainer").height(moreHeight).css('margin-bottom', '150px');
        }
    });
});


// fetch new quote function for button in quote content section
function newQuote() {
    event.preventDefault();
    var quoteUrl = 'https://quotes.rest/quote/random';
    $.ajax({
        headers: {
            "Accept": "application/json",
            "X-TheySaidSo-Api-Secret": "AT6ONGFY2IWNpQRVwpbuuAeF"
        },
        url: quoteUrl,
        global: false,
        success: function(response) {
            // console.log(response);
            // console.log(response.quoteText);

            if (response.contents.author == "") {
                $('.quote').html(response.contents.quote).fadeIn();
                $('.author').html('- Unknown Author').fadeIn();
            } else {
                $('.quote').html(response.contents.quote).fadeIn();
                $('.author').html(response.contents.author).fadeIn();
            }
            var adjustedHeight = "0";
            if ($('#random-quotes').parents('.box').height() > adjustedHeight) {
                adjustedHeight = $('#trails').parents('.box').height();
            }
            moreHeight = adjustedHeight + 50;
            $("#appContainer").height(moreHeight).css('margin-bottom', '150px');
        }
    });
};

// Groupon API
$('.get-groupon').on('click', function() {
    $.ajax({
        type: 'GET',
        url: "https://partner-api.groupon.com/deals.json?tsToken=US_AFF_0_201236_212556_0&offset=0&limit=10",
        async: false,
        jsonpCallback: 'jsonCallback',
        contentType: "application/json",
        dataType: 'jsonp',
        global: false
    }).done(function(data) {
        console.log(data);
        $.each(data.deals, function(idx, deal) {
            var grouponDeals = '<div class="deal"><div class="groupon-image"><img src="' + deal.largeImageUrl + '"></div><h3>' + deal.announcementTitle + '</h3><div class="fineprint">' + deal.finePrint + '</div><button class="btn btn-success deal-link"><a target="_blank" href="' + deal.dealUrl + '">Get Deal</a></button></div>'
            $("#groupon").append(grouponDeals);
        })
        $("#groupon").prepend("<h2>Check out these Deals!</h2><hr>");
        $("#groupon").fadeIn();
        var adjustedHeight = "0";
        if ($('#groupon').parents('.box').height() > adjustedHeight) {
            adjustedHeight = $('#trails').parents('.box').height();
        }
        moreHeight = adjustedHeight + 50;
        $("#appContainer").height(moreHeight).css('margin-bottom', '150px');
    });
});

// Google Maps/Places API


