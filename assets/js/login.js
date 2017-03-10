// firebase connection
var config = {
    apiKey: "AIzaSyAcxQ--hNXgtAP2ysfa5tGXq3lR_PgxRnQ",
    authDomain: "moodo-9a993.firebaseapp.com",
    databaseURL: "https://moodo-9a993.firebaseio.com",
    storageBucket: "moodo-9a993.appspot.com",
    messagingSenderId: "269081263117"
  };

firebase.initializeApp(config);

var username = "",
password = "";

  $(document).on("click", "#loginNow", addUser);

function addUser() {
  username = $('#username').val().trim();
  password = $('#password').val().trim();
  console.log(username);
    firebase.auth().createUserWithEmailAndPassword(username, password).catch(function(error) {
      console.log(username);
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // ...
    });

};