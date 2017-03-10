// firebase connection
  var config = {
    apiKey: "AIzaSyBrINciYykzgm93-J0NsRSLADGwsjUQREU",
    authDomain: "moodu-c5856.firebaseapp.com",
    databaseURL: "https://moodu-c5856.firebaseio.com",
    storageBucket: "moodu-c5856.appspot.com",
    messagingSenderId: "461647702901"
  };

firebase.initializeApp(config);

var username,
password;

$('#loginNow').on('click', function(event) {
  event.preventDefault;
  username = $('#username').val().trim();
  password = $('#password').val().trim();
  console.log(username);

    firebase.auth().createUserWithEmailAndPassword(username, password);
      console.log(username);
      console.log(password);

    });

