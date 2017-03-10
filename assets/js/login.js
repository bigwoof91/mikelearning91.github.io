// firebase connection
  var config = {
    apiKey: "AIzaSyBrINciYykzgm93-J0NsRSLADGwsjUQREU",
    authDomain: "moodu-c5856.firebaseapp.com",
    databaseURL: "https://moodu-c5856.firebaseio.com",
    storageBucket: "moodu-c5856.appspot.com",
    messagingSenderId: "461647702901"
  };

firebase.initializeApp(config);


var email = "";
var password = "";


$('#signUpNow').on('click', function(event) {
  event.preventDefault();

    email = $('#username').val().trim();
    password = $('#password').val().trim();

    firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
      var errorCode = error.code;
      var errorMessage = error.message;
    });

  console.log(email);
  console.log(password);
  $('#signup-modal').modal('toggle'); //or  $('#IDModal').modal('hide');
      return false;
  });

$('#loginNow').on('click', function(event) {
  event.preventDefault();

    email = $('#usernameLogin').val().trim();
    password = $('#passwordLogin').val().trim();

    firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
      var errorCode = error.code;
      var errorMessage = error.message;
    });

  console.log(email);
  console.log(password);
  $('#login-modal').modal('toggle'); //or  $('#IDModal').modal('hide');
      return false;
  });

