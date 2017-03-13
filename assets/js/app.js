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
    database = firebase.database();


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
    nextStep();
    var user = firebase.auth().currentUser;
    var uid = user.uid;

    var snap = takeSnapshot();
    var blob = dataURItoBlob(snap);
    // blob.replace("gs://moodo-9a993.appspot.com/selfies/gs:/moodo-9a993.appspot.com/selfie", "");

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
    
    CallAPI(blob, apiUrl, apiKey);

    function CallAPI(file, apiUrl, apiKey) {
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
            ProcessResult(response);
        }).fail(function(error) {
            $("#response").text(error.getAllResponseHeaders());
        });
    }

});

//adjust height of appContainer to fit box
$('#deliverContent').on('click', function() {
var biggestHeight = "0";
if ($(this).parents('.box').next('.box').height() > biggestHeight) {
    biggestHeight = $(this).parents('.box').next('.box').height()
}
$("#appContainer").height(biggestHeight).css('margin-bottom', '150px');
});

// animate steps on clicks
$('.next-step').click(function() {
    $(this).parents(".box").animate({ left: '-150%' }, 500);
    $(this).parents(".box").next(".box").animate({ left: '50%' }, 500);
});

$('.back-step').click(function() {
    $("#appContainer").css('margin-bottom', '0').css('height', '100%');
    $(this).parents(".box").animate({ left: '150%' }, 500);
    $(this).parents(".box").prev(".box").animate({ left: '50%' }, 500);
    $(this).parents(".box").children("#areYouFeeling").css('display', 'none');
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

$('#startOver').click(function() {
    $("#appContainer").css('margin-bottom', '0').css('height', '1000%');
    $(this).parents(".box").animate({ left: '300%' }, 500);
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
}


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

    return new Blob([ia], { type: mimeString });
};

// next step transition
function nextStep() {
    $(this).parents(".box").animate({ left: '-150%' }, 500);
    $(this).parents(".box").next(".box").animate({ left: '50%' }, 500);
};

    function ProcessResult(response) {
        var data = JSON.stringify(response);
        console.log(response[0]);

        var feelingMeasures = [response[0].scores.happiness, response[0].scores.anger, response[0].scores.disgust, response[0].scores.neutral];

        // iterate through feeling measures to only include 7 decimal places for each feeling's measurement
        var x = 0;
        var len = feelingMeasures.length
        while (x < len) {
            feelingMeasures[x] = feelingMeasures[x].toFixed(7);
            x++
        }
        // ----------------------- START - data prints on page -----------------------//
        // $('#dataHere').empty();
        // appends emotion measurements
        // $('#dataHere').append("<p>happiness: " + feelingMeasures[0] + "</p>");
        // $('#dataHere').append("<p>anger: " + feelingMeasures[1] + "</p>");
        // $('#dataHere').append("<p>disgust: " + feelingMeasures[2] + "</p>");
        // $('#dataHere').append("<p>neutral: " + feelingMeasures[3] + "</p>");
        // ----------------------- END - data prints on page -----------------------//

        // find max in the array of feelings
        var max = Math.max(...feelingMeasures);
          // console.log(feelingMeasures);
          // console.log(max);

        // asks user if the emotion is correct
        if (feelingMeasures[0] == max) {
            //console.log("1");
            $('#areYouFeeling').fadeIn();
            return $('#youAreFeeling').hide().html('You Seem Happy!! Are You?').fadeIn();
        }
        if (feelingMeasures[1] == max) {
            // console.log("2");
            $('#areYouFeeling').fadeIn();
            return $('#youAreFeeling').hide().html('You Seem Angry. Are You?').fadeIn();
        }
        if (feelingMeasures[2] == max) {
            // console.log("3");
            $('#areYouFeeling').fadeIn();
            return $('#youAreFeeling').hide().html('You Seem Disgusted. Are You?').fadeIn();
        }
        if (feelingMeasures[3] == max) {
            // console.log("4");
            $('#areYouFeeling').fadeIn();
            return $('#youAreFeeling').hide().html('Do you feel neutral? Mixed emotions possibly?').fadeIn();
        }

    };