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
        width: '120px',
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
            "Authorization": "Bearer BQAu76xcs9fHczdZNchgSb3g9tkxsM4ir6budWONx8zxue9VdUZWGaUQloArFel3dGm-vN8-oUinb1ZgpPFgkPwrIZ2rd1K9WluSQHVI66w6JOWlTk5sqheR0X_szka-LNtDtJAdxXVvkGKIhqDbp44xQ5TRxGzq7G8r1j7K193wTABgUknw8f90MMyrq5Gk-BV9VSym4dQWZg2VCCvIlWxKxJroxhKP_1mFlDyCYrHlaYPh4Dm-PWTUseQjTnR2LF-kpiosVj5PHiuHQKXFavAudRVDpJqj8kTvwEstnsngDQ0V"
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
                "Authorization": "Bearer BQAu76xcs9fHczdZNchgSb3g9tkxsM4ir6budWONx8zxue9VdUZWGaUQloArFel3dGm-vN8-oUinb1ZgpPFgkPwrIZ2rd1K9WluSQHVI66w6JOWlTk5sqheR0X_szka-LNtDtJAdxXVvkGKIhqDbp44xQ5TRxGzq7G8r1j7K193wTABgUknw8f90MMyrq5Gk-BV9VSym4dQWZg2VCCvIlWxKxJroxhKP_1mFlDyCYrHlaYPh4Dm-PWTUseQjTnR2LF-kpiosVj5PHiuHQKXFavAudRVDpJqj8kTvwEstnsngDQ0V"
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
            $("#playerDiv").append(player);
            $('#result-template').fadeIn('slow');
        });
    });
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

// Google Maps/Places/Books API


 pos = {
  
  lat: 40.328126,
  lng: -74.562241
};

var directionsService;
var directionsDisplay;


function initAutocomplete() {
  var map = new google.maps.Map(document.getElementById('mapper'), {
    center: {lat: 40.328126, lng: -74.562241},
    zoom: 13,
    mapTypeId: 'roadmap'
  });

  directionsDisplay = new google.maps.DirectionsRenderer;
  directionsService = new google.maps.DirectionsService;

  directionsDisplay.setMap(map);
  directionsDisplay.setPanel(document.getElementById('right-panel'));

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      var infoWindow = new google.maps.InfoWindow({map: map});

      infoWindow.setPosition(pos);
      infoWindow.setContent('You are here!!');
      map.setCenter(pos);
    }, function() {
      handleLocationError(true, infoWindow, map.getCenter());
    });
  } else {
    handleLocationError(false, infoWindow, map.getCenter());
  }

  function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ?
                        'Error: The Geolocation service failed.' :
                        'Error: Your browser doesn\'t support geolocation.');
  }

  // Create the search box and link it to the UI element.
  var input = document.getElementById('pac-input');
  var searchBox = new google.maps.places.SearchBox(input);
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

  // Bias the SearchBox results towards current map's viewport.
  map.addListener('bounds_changed', function() {
    searchBox.setBounds(map.getBounds());
  });

  var markers = [];
  // Listen for the event fired when the user selects a prediction and retrieve
  // more details for that place.
  searchBox.addListener('places_changed', function() {
    var places = searchBox.getPlaces();

    if (places.length == 0) {
      return;
    }

    loadResults(places.length, places);

    // Clear out the old markers.
    markers.forEach(function(marker) {
      marker.setMap(null);
    });
    markers = [];

    // For each place, get the icon, name and location.
    var bounds = new google.maps.LatLngBounds();
    places.forEach(function(place) {
      if (!place.geometry) {
        console.log("Returned place contains no geometry");
        return;
      }
      var icon = {
        url: place.icon,
        size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(25, 25)
      };

      // Create a marker for each place.
      markers.push(new google.maps.Marker({
        map: map,
        icon: icon,
        title: place.name,
        position: place.geometry.location
      }));

      if (place.geometry.viewport) {
        // Only geocodes have viewport.
        bounds.union(place.geometry.viewport);
      } else {
        bounds.extend(place.geometry.location);
      }
    });
    map.fitBounds(bounds);
  });
}

function loadResults(numResults, placeResults) {
  date = new Date();
  hours = date.getHours();
  minutes = date.getMinutes();
  day = date.getDay();
  currentTime = hours*100+minutes;
  console.log(currentTime);

  document.getElementById("results").innerHTML = "<h1>Optimized Place Search</h1> <h3>Find places you can get to when they're open</h3>";
  console.log(numResults);
  for (i = 0; i < numResults; i++) {
    var p1 = document.createElement("button");
    p1.setAttribute("id", String(i));



    var p2 = document.createElement("p");
    p2.setAttribute("id", "description_"+String(i));
    var resultDiv = document.createElement("div");
    resultDiv.setAttribute("id", "div_"+String(i));
    resultDiv.setAttribute("class", "resultDiv");

    var openNowStatus = document.createElement("p");
    openNowStatus.setAttribute("id", "openNow_"+String(i));

    var travelTimeData = document.createElement("p");
    travelTimeData.setAttribute("id", "travelTime_"+String(i));

    var etaTime = document.createElement("p");
    etaTime.setAttribute("id", "eta_"+String(i));

    console.log(placeResults[i].place_id);
    try{
      openHours = placeResults[i].opening_hours.periods[day].open.time;
    }
    catch(e){
      openHours='No work time';
    }

    try{
      closeHours = placeResults[i].opening_hours.periods[day].close.time;
    }
    catch(e){
      closeHours='No work time';
    }
    flag1 = true;
    if ((openHours!="No work time")&&(closeHours=="No work time")) {
      closeHours = "0000";
      flag1 = false;
    }
    flag = true;
    if ((openHours=="No work time")&&(closeHours=="No work time")) {
      flag = false;
    } else {
      openHoursFormatted = openHours.substring(0, 2) + ":" + openHours.substring(2, 4);
      closeHoursFormatted = closeHours.substring(0, 2) + ":" + closeHours.substring(2, 4);
      var businessHours = document.createElement("p");
      businessHours.setAttribute("id", "busHours_"+String(i));
    }
    if (!flag1) {
      closeHours = "2400";
    }
    if (closeHours < openHours) {
      closeHours = parseInt(closeHours) + 2400;
    }

    console.log(openHours + " " + closeHours);

    try{
      open = placeResults[i].opening_hours.open_now ? "Open Now" : "Closed";
    }
    catch(e){
      open='No opening status available';
    }

    console.log(open);


    mapsTravelTime=getJSON("http://www.mapquestapi.com/directions/v2/route?key=0HG8b7rdqIkwZdFNGenpycewpmvze9KB&from=" + pos.lat + "," + pos.lng + "&to=" + placeResults[i].geometry.location.lat() + "," + placeResults[i].geometry.location.lng() + "&callback=renderNarrative");

    travelTimeBeg = mapsTravelTime.indexOf("formattedTime") + 16;
    travelTimeSub = mapsTravelTime.substring(travelTimeBeg);

    travelTimeString = travelTimeSub.substring(0, 5);

    travelTimeHours = travelTimeString.substring(0, 2);

    travelTimeMinutes = travelTimeString.substring(3);

    travelTimeSingle = parseInt(travelTimeHours)*100+parseInt(travelTimeMinutes);
    console.log(travelTimeSingle);

    if (travelTimeHours.substring(0, 1)=="0") {
      travelTimeHours = travelTimeHours.substring(1);
    }

    if (travelTimeMinutes.substring(0, 1)=="0") {
      travelTimeMinutes = travelTimeMinutes.substring(1);
    }

    projectedTime = travelTimeSingle + currentTime;
    if (projectedTime > 2400) {
      projectedTime = projectedTime - 2400;
    }
    if (flag) {
      if ((projectedTime >= parseInt(openHours)) && (projectedTime <= parseInt(closeHours))) {
        console.log(projectedTime + " YOU CAN GO");
        willMakeIt = "You will arrive during business hours";
      } else {
        console.log(projectedTime + " YOU WILL NOT BE ABLE TO GO");
        willMakeIt = "You will NOT arrive during business hours";
      }
    } else {
      willMakeIt = "No business hours data available";
    }



    console.log("http://www.mapquestapi.com/directions/v2/route?key=0HG8b7rdqIkwZdFNGenpycewpmvze9KB&from=" + pos.lat + "," + pos.lng + "&to=" + placeResults[i].geometry.location.lat() + "," + placeResults[i].geometry.location.lng() + "&callback=renderNarrative");

    console.log(travelTimeHours + " " + travelTimeMinutes);

    etaMinutes = String(projectedTime%100);
    if (etaMinutes.length == 1) {
      etaMinutes = "0" + String(projectedTime%100);
    }

    eta = String(Math.floor(projectedTime/100)) + ":" + etaMinutes;
    if (parseInt(etaMinutes) >= 60) {
      etaMinutes = String(parseInt(etaMinutes)-60);
      eta = String(Math.floor(projectedTime/100)+1) + ":" + etaMinutes;
      if ((Math.floor(projectedTime/100)+1)>= 24) {
        eta = String(Math.floor(projectedTime/100)+1-24) + ":" + etaMinutes;
      }
    }
    console.log(eta);

    var willMakeItData = document.createElement("p");
    willMakeItData.setAttribute("id", "willMakeIt_"+String(i));
    if (willMakeIt == "You will arrive during business hours") {
      willMakeItData.setAttribute("style", "color: green;");
    } else if (willMakeIt == "You will NOT arrive during business hours"){
      willMakeItData.setAttribute("style", "color: red;");
    }

    var image = document.createElement("img");
    image.setAttribute("id", "image_"+String(i));
    try  {
      imageUrl = placeResults[i].photos[0].getUrl();
    } catch (e) {
      imageUrl = "error";
    }
    if (imageUrl != "error") {
      imgFlag = true;
    } else {
      imgFlag = false;
    }
    if (imgFlag) {
      image.setAttribute("src", imageUrl);
    }



    document.getElementById("results").appendChild(resultDiv);
    document.getElementById("div_"+String(i)).appendChild(p1);
    document.getElementById("div_"+String(i)).appendChild(p2);
    document.getElementById("div_"+String(i)).appendChild(openNowStatus);
    document.getElementById("div_"+String(i)).appendChild(travelTimeData);
    document.getElementById("div_"+String(i)).appendChild(etaTime);
    document.getElementById("div_"+String(i)).appendChild(willMakeItData);
    document.getElementById("div_"+String(i)).appendChild(document.createElement("p"));
    document.getElementById("div_"+String(i)).appendChild(image);


    document.getElementById(String(i)).innerHTML = placeResults[i].name;
    document.getElementById("description_"+String(i)).innerHTML = placeResults[i].formatted_address;
    document.getElementById("openNow_"+String(i)).innerHTML = open;
    document.getElementById("travelTime_"+String(i)).innerHTML = travelTimeHours + " hr " + travelTimeMinutes + " min";
    document.getElementById("eta_"+String(i)).innerHTML = "Best-case Estimated Time of Arrival: " + eta;
    document.getElementById("willMakeIt_"+String(i)).innerHTML = willMakeIt;

    placeLat = placeResults[i].geometry.location.lat();
    placeLng = placeResults[i].geometry.location.lng();
    placeAddress = placeResults[i].formatted_address;

    document.getElementById(String(i)).addEventListener("click", function() {
        getDirections(directionsService, directionsDisplay, pos.lat, pos.lng, placeAddress)
    }, false);

    if (flag) {
      document.getElementById("div_"+String(i)).appendChild(businessHours);
      document.getElementById("busHours_"+String(i)).innerHTML = "Hours: " + openHoursFormatted + " to " + closeHoursFormatted;
    }

    if (imgFlag) {
      console.log(imageUrl);
      document.getElementById("image_"+String(i)).innerHTML = image;
    }
  }

}

function getDirections(directionsService, directionsDisplay, startLat, startLng, endPlace) {
        var start = {lat: startLat, lng: startLng};
        var end = endPlace;
        directionsService.route({
          origin: start,
          destination: end,
          travelMode: 'DRIVING'
        }, function(response, status) {
          if (status === 'OK') {
            directionsDisplay.setDirections(response);
          } else {
            window.alert('Directions request failed due to ' + status);
          }
        });

      }



function getJSON(url) {
    var response;
    var xmlHttp;

    response  = "";
    xmlHTTP = new XMLHttpRequest();

    if(xmlHTTP !== null)
    {
        xmlHTTP.open( "GET", url, false );
        xmlHTTP.send( null );
        response = xmlHTTP.responseText;
    }

    return response;
}

// animate next step to map
$('.next-step-maps').click(function() {
    $('#appContainer').animate({ top: '-500%' }, 800);
    $('#mapContainer').animate({ top: '12%' }, 800);
    $('#goBackFromMaps').animate({ top: '0' }, 500);
    $("#restartFromOptions").animate({ top: "-150px" });
});
// animate back one step from map
$('#goBackFromMaps').click(function() {
    $('#mapContainer').animate({ top: '500%' }, 800);
    $('#appContainer').animate({ top: '0' }, 800);
    $(this).animate({ top: "-150px" });
    $("#restartFromOptions").animate({ top: "0" });


});
// Comic API
