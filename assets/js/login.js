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
var signinForm = $('#signinForm');
var signupForm = $('#signupForm');

$('#signUpNow').on('click', function(event) {
  event.preventDefault();
    clearSignupError();
    email = $('#username').val().trim();
    password = $('#password').val().trim();

    firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
      console.log(error.code);
      console.log(error.message);
      showSignupError();
    });

  console.log(email);
  console.log(password);

  firebase.auth().onAuthStateChanged(user => {
    if(user) {
    window.location = 'profile.html';
    }
  });
  // $('#login-modal').modal('toggle'); //or  $('#IDModal').modal('hide');
  //     return false;  
});

$('#loginNow').on('click', function(event) {
  event.preventDefault();
    clearLoginError();
    email = $('#usernameLogin').val().trim();
    password = $('#passwordLogin').val().trim();

    firebase.auth().signInWithEmailAndPassword(email, password).then(function(result) {
      firebase.auth().onAuthStateChanged(user => {
        if(user) {
        window.location = 'app.html';
        }
      })
    }).catch(function(error) {
      console.log(error.code);
      console.log(error.message);
      showLoginError();
    });

  console.log(email);
  console.log(password);

});

// register button inside login modal - this will close login modal (as the data attributes are set to open the sign up modal)
$('#registerButton').on('click', function() {
  $('#login-modal').modal('toggle'); //or  $('#IDModal').modal('hide');
});

// show error if login failed
function showLoginError() {
  $('#usernameLogin').addClass('error');
  $('#passwordLogin').addClass('error');
  $('#loginUnErrMes').html('Invalid email');
  $('#loginPwErrMes').html('Invalid password');
};
// clear error onclick of next login button click
function clearLoginError() {
  $('#usernameLogin').removeClass('error');
  $('#passwordLogin').removeClass('error');
  $('#loginUnErrMes').empty();
  $('#loginPwErrMes').empty();

};

// show error if signup failed
function showSignupError() {
  $('#username').addClass('error');
  $('#password').addClass('error');
  $('#signupUnErrMes').html('invalid email');
  $('#signupPwErrMes').html('Must be at least 6 characters');
};
// clear error onlick of next signup button click
function clearSignupError() {
  $('#username').removeClass('error');
  $('#password').removeClass('error');
  $('#signupUnErrMes').empty();
  $('#signupPwErrMes').empty();
};

// clear login/signup form in modal on close/cancel
$('[data-dismiss=modal]').on('click', function (e) {
    var $t = $(this),
        target = $t[0].href || $t.data("target") || $t.parents('.modal') || [];
    
  $(target)
    .find("input,textarea")
       .val('')
       .end()
  clearSignupError();
  clearLoginError();
})



// -------------------------Need to add forgot password-------------------------//
// var auth = firebase.auth();
// var emailAddress = "user@example.com";

// auth.sendPasswordResetEmail(emailAddress).then(function() {
//   // Email sent.
// }, function(error) {
//   // An error happened.
// });
// -------------------------END Need to add forgot password-------------------------//