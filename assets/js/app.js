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
    placesCategory,
    booksCategory;


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
    // $('.overlay-advice').delay(500).fadeIn('slow').delay(1500).fadeOut('slow');
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
    $("#commentContainer").delay(500).animate({ opacity: '1' }, 500);
    $("#commentContainer").delay(3000).animate({ left: '-200%', opacity: '0' }, 500);
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
    $("#commentContainer").removeAttr('style');
    $('#mooduComment').html('I found more <br>stuff for you');
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
    $("#commentContainer").removeAttr('style');
    $('#youAreFeeling').empty();
    $("#trails").empty();
    $("#random-quotes").empty();
    $("#groupon").empty();
    $("#playerDiv").empty();
    $("#books").empty();

    var adjustedHeight = "0";
    if ($(this).parents('.box').prev('.box').height() > adjustedHeight) {
        adjustedHeight = $(this).parents('.box').prev('.box').height();
    }
    moreHeight = adjustedHeight + 50;
    $("#appContainer").height(moreHeight).css('margin-bottom', '50px');
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
        placesCategory = "restaurant"; // setting var category for Google Places API
        booksCategory = "happy"; // setting var category for Google Books API
        $('#mapContainer').empty();
        $('#mapDetails').empty();
        initAutocomplete();
        $('#places-title').html('Moodü Says Go Out to Eat');
        $('#getPlaces').html('Nearby Food Joints')
        $('#placesIMG').attr('src', 'assets/images/restaurant.png').attr('alt', 'Restaurants');
        $('#areYouFeeling').fadeIn();
        return $('#youAreFeeling').hide().html('You Seem Happy!! Are You?').fadeIn();
    }
    if (feelingMeasures[1] == max) {
        placesCategory = "gym";
        booksCategory = "anger"; // setting var category for Google Books API
        $('#mapContainer').empty();
        $('#mapDetails').empty();
        initAutocomplete();
        $('#places-title').html('Moodü Says To "Workout" Your Feelings');
        $('#getPlaces').html('Go To Nearby Gym')
        $('#placesIMG').attr('src', 'assets/images/workout.png').attr('alt', 'Gym');
        $('#areYouFeeling').fadeIn();
        return $('#youAreFeeling').hide().html('You Seem Angry. Are You?').fadeIn();
    }
    if (feelingMeasures[2] == max) {
        placesCategory = "movie_rental";
        booksCategory = "disgusting"; // setting var category for Google Books API
        $('#mapContainer').empty();
        $('#mapDetails').empty();
        initAutocomplete();
        $('#places-title').html('Moodü Says Go See A Movie');
        $('#getPlaces').html('Nearby Theaters')
        $('#placesIMG').attr('src', 'assets/images/movie_theater.png').attr('alt', 'Movie Theaters');
        $('#areYouFeeling').fadeIn();
        return $('#youAreFeeling').hide().html('You Seem Disgusted. Are You?').fadeIn();
    }
    if (feelingMeasures[3] == max) {
        placesCategory = "shopping_mall";
        console.log(placesCategory)
        booksCategory = "fiction"; // setting var category for Google Books API
        $('#mapContainer').empty();
        $('#mapDetails').empty();
        initAutocomplete();
        $('#places-title').html('Moodü Suggests You <br>"Fill Your Void" With Presents For Yourself');
        $('#getPlaces').html('Nearby Shopping Malls')
        $('#placesIMG').attr('src', 'assets/images/shopping_mall.png').attr('alt', 'Shopping Malls');
        $('#areYouFeeling').fadeIn();
        return $('#youAreFeeling').hide().html('Do you feel neutral? Mixed emotions possibly?').fadeIn();
    }
    if (feelingMeasures[4] == max) {
        placesCategory = "night_club";
        booksCategory = "happy"; // setting var category for Google Books API
        $('#mapContainer').empty();
        $('#mapDetails').empty();
        initAutocomplete();
        $('#places-title').html('Moodü Found Night Clubs');
        $('#getPlaces').html('Go Party Tonight')
        $('#placesIMG').attr('src', 'assets/images/night_club.png').attr('alt', 'Night Clubs');
        $('#areYouFeeling').fadeIn();
        return $('#youAreFeeling').hide().html("You look surprised? Are you goofin' around?").fadeIn();
    }
    if (feelingMeasures[5] == max) {
        placesCategory = "police";
        booksCategory = "life"; // setting var category for Google Books API
        $('#mapContainer').empty();
        $('#mapDetails').empty();
        initAutocomplete();
        $('#places-title').html('Moodü Found Police Stations');
        $('#getPlaces').html('Go Be Safe')
        $('#placesIMG').attr('src', 'assets/images/police.png').attr('alt', 'Police');
        $('#areYouFeeling').fadeIn();
        return $('#youAreFeeling').hide().html("AHHH! You seem scared, it's sorta' creepy. Do you feel fearful?").fadeIn();
    }
    if (feelingMeasures[6] == max) {
        placesCategory = "meal_delivery";
        booksCategory = "motivational"; // setting var category for Google Books API
        $('#mapContainer').empty();
        $('#mapDetails').empty();
        initAutocomplete();
        $('#places-title').html('Moodü Found Food Delivery Spots');
        $('#getPlaces').html('Go Fill Your Void')
        $('#placesIMG').attr('src', 'assets/images/food_delivery.png').attr('alt', 'Food Delivery Places');
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
    var queryURL = "https://api.discogs.com/releases/249504";
    $.ajax({
        url: queryURL,
        header: { 'X-Frame-Options': 'GOFORIT' },
        method: "GET",
        global: false
    }).done(function(response) {
        console.log(response);
        console.log(response.videos[1].uri)

        var songSource = response.videos[1].uri;
        var songSourceNew = songSource.replace("watch?v=", "embed/");
        console.log(songSource);
        console.log(songSourceNew);
        var player = "<iframe src='" + songSourceNew + "' frameborder='0' allowfullscreen></iframe>";

        $("#playerDiv").append(player);
        $("#playerDiv").fadeIn('slow');
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
        beforeSend: function() {
            $('#preloader').show();
            $('#preloadText').html("Finding <span class='hideOn640'>Quotes</span>");
        },
        success: function(response) {
            console.log(response);
            $('#preloader').hide();
            $('#preloadText').html("Analyzing <span class='hideOn640'>Emotions</span>");
            var quotesContainer = $("#random-quotes");
            quotesContainer.append('<h1 class="quote-title">Hope this makes you feel beary good</h1><hr>')
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
        beforeSend: function() {
            $('#random-quotes').empty();
            $('#preloader').show();
            $('#preloadText').html("Finding <span class='hideOn640'>Quotes</span>");
        },
        success: function(response) {
            $('#preloader').hide();
            $('#preloadText').html("Analyzing <span class='hideOn640'>Emotions</span>");

            var quotesContainer = $("#random-quotes");
            quotesContainer.append('<h1 class="quote-title">This should make you feel beary beary good</h1><hr>')
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
        global: false,
        beforeSend: function() {
            $('#random-quotes').empty();
            $('#preloader').show();
            $('#preloadText').html("Finding <span class='hideOn640'>Deals</span>");
        }
    }).done(function(data) {
        $('#preloader').hide();
        $('#preloadText').html("Analyzing <span class='hideOn640'>Emotions</span>");
        console.log(data);
        $.each(data.deals, function(idx, deal) {
            var grouponDeals = '<div class="deal row"><div class="col-lg-12"><div class="groupon-image"><img alt="groupon image" src="' + deal.largeImageUrl + '"></div><h3>' + deal.announcementTitle + '</h3><div class="fineprint">' + deal.finePrint + '</div><button class="btn btn-success deal-link"><a target="_blank" href="' + deal.dealUrl + '">Get Deal</a></button></div></div>'
            $("#groupon").append(grouponDeals);
        });
        $("#groupon").prepend("<h2 class='quote-title'>Check Out These Deals!</h2><hr>");
        $("#groupon").fadeIn();

        var adjustedHeight = "0";
        if ($('#groupon').parents('#content').height() > adjustedHeight) {
            adjustedHeight = $('#groupon').parents('#content').height();
        };
        moreHeight = adjustedHeight + 50;
        $("#appContainer").height(moreHeight).css('margin-bottom', '150px');
    });
});

// Google Maps/Places/Books API
var pos = {

    lat: 40.328126,
    lng: -74.562241
};


var map;
var infoWindow;

console.log(placesCategory);

function initAutocomplete() {
    map = new google.maps.Map(document.getElementById('mapContainer'), {
        center: { lat: 40.328126, lng: -74.562241 },
        zoom: 10
    });

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            infoWindow = new google.maps.InfoWindow();
            map.setCenter(pos);
            var service = new google.maps.places.PlacesService(map);
            service.nearbySearch({
                location: pos,
                radius: 8000,
                type: [placesCategory]
            }, callback);

        }, function() {
            handleLocationError(true, infoWindow, map.getCenter());
        });
    } else {
        handleLocationError(false, infoWindow, map.getCenter());
    }
}

function callback(results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
        for (var i = 0; i < results.length; i++) {
            createMarker(results[i]);
            console.log(results[i]);
            var placeCont = $('<div id="place-cont">');
            placeCont.append('<h4 id="place-name">' + results[i].name + '</h4>');
            placeCont.append('<img class="place-icon" style="float:right" src="' + results[i].icon + '">');
            placeCont.append('<p id="place-name" class="end" value="' + results[i].vicinity + '">' + results[i].vicinity + '</button>');
            https: //www.google.com/maps/place/1860+NJ-10,+Parsippany,+NJ+07054
                $('#mapDetails').append(placeCont);
        }
    }
}
var destLoc;
var onChangeHandler;

function createMarker(place) {
    var placeLoc = place.geometry.location;
    var marker = new google.maps.Marker({
        map: map,
        position: placeLoc
    });
    var endPoint = $('.end');
    google.maps.event.addListener(marker, 'click', function() {
        onChangeHandler;
        infoWindow.setContent(place.name);
        infoWindow.open(map, this);
        destLoc = (place.geometry.location);
        calculateAndDisplayRoute();
        console.log(this);
    });


};


function calculateAndDisplayRoute(directionsService, directionsDisplay) {

    onChangeHandler = function() {
        calculateAndDisplayRoute(directionsService, directionsDisplay);
    };

    var directionsService = new google.maps.DirectionsService;
    var directionsDisplay = new google.maps.DirectionsRenderer;

    directionsDisplay.setMap(map);

    directionsService.route({
        origin: pos,
        destination: destLoc,
        travelMode: 'DRIVING'
    }, function(response, status) {
        if (status === 'OK') {

            directionsDisplay.setDirections(response);

        } else {
            window.alert('Directions request failed due to ' + status);
            console.log(directionsService);
        }
    });
    console.log(pos);
}


// animate next step to map
$('.next-step-maps').click(function() {
    $('#appContainer').animate({ top: '-500%' }, 800);
    $('#mapContainer').animate({ top: '12%' }, 800);
    $('#goBackFromMaps').animate({ top: '0' }, 500);
    $("#restartFromOptions").animate({ top: "-150px" });
    $('#mapDetails').animate({ bottom: '13%' }, 1400);
    $('#mooduComment').html('I found some <br>cool spots...');
    $("#commentContainer").delay(500).animate({ left: '131px', opacity: '1' }, 500);
    $("#commentContainer").delay(3000).animate({ left: '-200%', opacity: '0' }, 800);
});
// animate back one step from map
$('#goBackFromMaps').click(function() {
    $('#mapContainer').animate({ top: '500%' }, 800);
    $('#appContainer').animate({ top: '0' }, 800);
    $(this).animate({ top: "-150px" });
    $("#restartFromOptions").animate({ top: "0" });
    $('#mapDetails').animate({ bottom: '-400%' }, 800);
    $("#commentContainer").removeAttr('style');
});


// Trails API if interest hiking is checked in profile
firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        var user = firebase.auth().currentUser;
        var userId = user.uid;
        firebase.database().ref('temp/users/' + userId).on('value', function(snapshot) {
            var hikingTrue = snapshot.val().hiking;
            console.log("hiking: " + hikingTrue);
            if (hikingTrue === true) {
                $('.hiking-card').show();
            } else {
                $('.hiking-card').hide();
                $('#center-if').css('width', '100%')
            }
        });
    }
});

var trailsUrl = 'https://trailapi-trailapi.p.mashape.com/?lat=' + pos.lat + '&lon=' + pos.lng + '&q[activities_activity_type_name_eq]=hiking&radius=20';
var longitude;
var latitude;
$('#getTrails').on('click', function() {
    $.ajax({
        url: trailsUrl,
        dataType: 'JSON',
        headers: {
            'X-Mashape-Key': 'rXe4JWi3fImshsUjJwP4gQhzkBFDp1XOF1HjsntrFYaYzWaaYs'
        },
        beforeSend: function() {
            $('#random-quotes').empty();
            $('#preloader').show();
            $('#preloadText').html("Finding <span class='hideOn640'>Trails</span>");
        },
        type: "GET",
        global: false
    }).done(function(response) {
        $('#preloader').hide();
        $('#preloadText').html("Analyzing <span class='hideOn640'>Emotions</span>");
        console.log(response);
        var trailsResponse = response.places;
        for (var k = 0; k < trailsResponse.length; k++) {
            if (trailsResponse[k].description === null) {
                continue; // skips "'null' description" locations
            }
            var trailInfo = $('<div class="trail-info">').fadeIn();
            trailInfo.append('<img class="trail-image-holder" width="75" height="75" src="assets/images/trail.png">').fadeIn();
            trailInfo.append('<h3 class="trail-name">' + trailsResponse[k].name + '</h3>').fadeIn();
            trailInfo.append('<h4 class="trail-city">' + trailsResponse[k].city + '</h4>').fadeIn();
            trailInfo.append('<p class="trail-des">' + trailsResponse[k].description + '</p>').fadeIn();
            trailInfo.append('<button class="btn btn-success trail-link"><a target="_blank" title="Trail Info" href="' + trailsResponse[k].activities["0"].url + '">Go To Trail</a></button>').fadeIn();
            $('#trails').append(trailInfo);

        }
        $('#trails').prepend("<h2 class='quote-title'>I found some trails and parks nearby.<hr>");
        $('#trails').fadeIn('slow');
        $('#mooduComment').html('Watch out for<br>bears!');
        $("#commentContainer").delay(200).animate({ opacity: '1', left: '131px' }, 500);
        $("#commentContainer").delay(3000).animate({ left: '-200%', opacity: '0' }, 800);
        // adjusts height of box
        var adjustedHeight = "0";
        if ($('#trails').parents('.box').height() > adjustedHeight) {
            adjustedHeight = $('#trails').parents('.box').height();
        }
        moreHeight = adjustedHeight + 50;
        $("#appContainer").height(moreHeight).css('margin-bottom', '150px');
    }).fail(function(error) {
        console.log(error);
    });

});

$('#getBooks').on('click', function() {
    // Google Books API

    $.ajax({
        url: "https://www.googleapis.com/books/v1/volumes?q=" + booksCategory + "&maxResults=20",
        dataType: "json",
        global: false,
        beforeSend: function() {
            $('#random-quotes').empty();
            $('#preloader').show();
            $('#preloadText').html("Finding <span class='hideOn640'>Books</span>");
        }
    }).done(function(result) {
        $('#preloader').hide();
        $('#preloadText').html("Analyzing <span class='hideOn640'>Emotions</span>");
        for (var p = 0; p < result.items.length; p++) {
            var bookList = $('#books');
            var bookDetails = $('<div id="bookDetails" class="row">');
            console.log(result.items[p]);
            if (result.items[p].volumeInfo.description === undefined || result.items[p].saleInfo.buyLink === undefined) {
                continue
            }

            bookDetails.append('<div class="col-lg-12"><div class="book-info"><h3 class="book-title">' + result.items[p].volumeInfo.title + '</h3><p>' + result.items[p].volumeInfo.description + '</p></div><img alt="cover" src="' + result.items[p].volumeInfo.imageLinks.thumbnail + '"></div>');
            bookDetails.append('<a title="buy now" class="btn btn-success get-book-info" target="_blank" href="' + result.items[p].volumeInfo.infoLink + '">Get Book Info</a>');
            bookList.append(bookDetails);
        }
        bookList.prepend('<h2 class="quote-title">Check These Books Out</h2><hr>')
        bookList.fadeIn();
        $('#mooduComment').html('Look what I <br>found...');
        $("#commentContainer").delay(200).animate({ opacity: '1', left: '131px' }, 500);
        $("#commentContainer").delay(3000).animate({ left: '-200%', opacity: '0' }, 800);

        var adjustedHeight = "0";
        if ($('#books').parents('.box').height() > adjustedHeight) {
            adjustedHeight = $('#books').parents('.box').height();
        }
        moreHeight = adjustedHeight + 50;
        $("#appContainer").height(moreHeight).css('margin-bottom', '150px');

    });
});
