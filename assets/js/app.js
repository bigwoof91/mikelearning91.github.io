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
  if(!user) {
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
navigator.getMedia = ( navigator.getUserMedia ||
                      navigator.webkitGetUserMedia ||
                      navigator.mozGetUserMedia ||
                      navigator.msGetUserMedia ||
                      navigator.oGetUserMedia );


if(!navigator.getMedia){
  displayErrorMessage("Your browser doesn't have support for the navigator.getUserMedia interface.");
}
else{

  // Request the camera.
  navigator.getMedia(
    {
      video: true
    },
    // Success Callback
    function(stream){

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
    function(err){
      displayErrorMessage("There was an error with accessing the camera stream: " + err.name, err);
    }
  );

}



// Mobile browsers cannot play video without user input,
// so here we're using a button to start it manually.
start_camera.addEventListener("click", function(e){

  e.preventDefault();

  // Start video playback manually.
  video.play();
  showVideo();

});

take_photo_btn.addEventListener("click", function(e){

  e.preventDefault();

  var snap = takeSnapshot();
  var blob = dataURItoBlob(snap);

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
    var uid;

    if (user != null) {
    uid = user.uid;  // The user's ID, unique to the Firebase project. Do NOT use
                     // this value to authenticate with your backend server, if
                     // you have one. Use User.getToken() instead.
    }
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
    var selfieImagesRef = storageRef.child('/selfies/' + uid  + '-' + selfieID++ + '.png');


    // While the file names are the same, the references point to different files
    selfieRef.name === selfieImagesRef.name            // true
    selfieRef.fullPath === selfieImagesRef.fullPath    // false

    var file = blob; // use the Blob or File API
    var uploadTask = selfieImagesRef.put(file);
  
    var handlesImgSaved = selfieImagesRef.getDownloadURL();


    // `url` is the download URL for 'images/stars.jpg'
    $(function() {
        var params = {
            // Request parameters
        };

        $.ajax({
            url: "https://westus.api.cognitive.microsoft.com/emotion/v1.0/recognize?" + $.param(params),
            beforeSend: function(xhrObj){
                // Request headers
                xhrObj.setRequestHeader("Content-Type","application/json");
                xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key","f8c966943aa0419ea6b294f135365d95");
            },
            type: "POST",
            // Request body
            data: blob,
        })
        .done(function(data) {
            alert("success");
        })
        .fail(function() {
            alert("error");
        });
    });

    });

      //----------------------- trying to get downloadURL to send to microsoft service -----------------------//
      // when sending downloadURL to microsoft I am getting an error saying "FailedToDownloadImage" 400 error bad request
      //-----------------------START-----------------------

      //   selfieImagesRef.getDownloadURL().then(function(url) {
      //   // `url` is the download URL for 'images/stars.jpg'

      //   // This can be downloaded directly:
      //   var xhr = new XMLHttpRequest();
      //   xhr.responseType = 'blob';
      //   xhr.onload = function(event) {
      //     var blob = xhr.response;
      //   };
      //   xhr.open('GET', url);
      //   xhr.send();

      //   // Or inserted into an <img> element:
      //   var img = document.getElementById('myimg');
      //   img.src = url;
      // }).catch(function(error) {
      //   // Handle any errors
      // });
      //-----------------------END-----------------------

delete_photo_btn.addEventListener("click", function(e){

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



function showVideo(){
  // Display the video stream and the controls.

  hideUI();
  video.classList.add("visible");
  controls.classList.add("visible");
}

function takeSnapshot(){
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


function displayErrorMessage(error_msg, error){
  error = error || "";
  if(error){
    console.log(error);
  }

  error_message.innerText = error_msg;

  hideUI();
  error_message.classList.add("visible");
}


function hideUI(){
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

    return new Blob([ia], {type:mimeString});
};