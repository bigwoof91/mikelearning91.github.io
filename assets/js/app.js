// firebase connection
var config = {
    apiKey: "AIzaSyAcxQ--hNXgtAP2ysfa5tGXq3lR_PgxRnQ",
    authDomain: "moodo-9a993.firebaseapp.com",
    databaseURL: "https://moodo-9a993.firebaseio.com",
    storageBucket: "moodo-9a993.appspot.com",
    messagingSenderId: "269081263117"
  };

firebase.initializeApp(config);

// References to all the element we will need.
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
    var snap = takeSnapshot();
    var blob = dataURItoBlob(snap);
    // blob.replace("gs://moodo-9a993.appspot.com/selfies/gs:/moodo-9a993.appspot.com/selfie", "");

    // Create a root reference
    var storageRef = firebase.storage().ref();

    // Create a reference to 'mountains.jpg'
    var selfieRef = storageRef.child('selfie.png');

    // Create a reference to 'images/mountains.jpg'
    var selfieImagesRef = storageRef.child('/selfies' + selfieRef);


    // While the file names are the same, the references point to different files
    selfieRef.name === selfieImagesRef.name            // true
    selfieRef.fullPath === selfieImagesRef.fullPath    // false

    var file = blob; // use the Blob or File API
    var uploadTask = selfieImagesRef.put(file);
});

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




// var 
// var dataURL = canvas.toDataURL('image/jpeg', 0.5);
// var blob = dataURItoBlob(dataURL);
// var fd = new FormData(document.forms[0]);
// fd.append("canvasImage", blob);


//------------------------- upload selfie to firebase -------------------------//

// function onSuccess(imageData) {
//   var image = $document[0].getElementById('snap');
//   image.src = "data:image/png;base64," + imageData;
// }

// $('#download-photo').on('change', function(event) {
//   selfie = event.target.files[0];
// })

// function uploadToFirebase() {
//     var filename = selfie.name;
//     var storageRef = firebase.storage().ref('/selfies' + filename).put(blob);
//     var uploadTask = storageRef.put(selfie);

//     uploadTask.on('state_changed', function(snapshot) {

//     }, function(error) {

//     }, function() {

//         var downloadURL = uploadTask.snapshot.downloadURL;
//         console.log(downloadURL);
//     });

// };

// $('#download-photo').on("click", function() {
//   var snap = takeSnapshot();
//   var imgData = snap;
//   var message = 'imgData';
//   database.ref().putString(message, 'data_url').then(function(snapshot) {
//   console.log('Uploaded a data_url string!');
//   })
// });

// $(document).on("click", "#download-photo", dataURItoBlob);



// function dataURItoBlob(dataURI) {
//     var snap = $("#snap").attr('src');
//     // convert base64 to raw binary data held in a string
//     // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
//     var snap = atob(dataURI.split(',')[1]);

//     // separate out the mime component
//     var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

//     // write the bytes of the string to an ArrayBuffer
//     var ab = new ArrayBuffer(byteString.length);
//     var ia = new Uint8Array(ab);
//     for (var i = 0; i < byteString.length; i++) {
//         ia[i] = byteString.charCodeAt(i);
//     }

//     //Old Code
//     //write the ArrayBuffer to a blob, and you're done
//     //var bb = new BlobBuilder();
//     //bb.append(ab);
//     //return bb.getBlob(mimeString);

//     //New Code
//     return new Blob([ab], {type: mimeString});


//     var filename = Blob([ab], {type: mimeString}).name;
//     var storageRef = firebase.storage().ref('/selfies' + filename).put(blob);
//     var uploadTask = storageRef.put(selfie);

//     uploadTask.on('state_changed', function(snapshot) {

//     }, function(error) {

//     }, function() {

//         var downloadURL = uploadTask.snapshot.downloadURL;
//         console.log(downloadURL);
//     });

// };

// // Create a root reference
// var storageRef = firebase.storage().ref('/selfies' + filename);

// // Create a reference to 'mountains.jpg'
// var mountainsRef = storageRef.child('mountains.jpg');

// // Create a reference to 'images/mountains.jpg'
// var mountainImagesRef = storageRef.child('images/mountains.jpg');

// // While the file names are the same, the references point to different files
// mountainsRef.name === mountainImagesRef.name            // true
// mountainsRef.fullPath === mountainImagesRef.fullPath    // false