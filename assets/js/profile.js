// firebase connection
var config = {
    apiKey: "AIzaSyBrINciYykzgm93-J0NsRSLADGwsjUQREU",
    authDomain: "moodu-c5856.firebaseapp.com",
    databaseURL: "https://moodu-c5856.firebaseio.com",
    storageBucket: "moodu-c5856.appspot.com",
    messagingSenderId: "461647702901"
};

firebase.initializeApp(config);


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
$('[data-dismiss=modal]').on('click', function(e) {
    var $t = $(this),
        target = $t[0].href || $t.data("target") || $t.parents('.modal') || [];

    $(target)
        .find("input[type=email],input[type=password]")
        .val('')
        .end()
    clearSignupError();
    clearLoginError();
})

// redirect to login page if user is not logged in
firebase.auth().onAuthStateChanged(function(user) {
    if (!user) {
        window.location.href = 'login.html';
    } else {
        var user = firebase.auth().currentUser;
        var name, email, photoUrl, uid, emailVerified;

        if (user != null) {
            name = user.displayName;
            email = user.email;
            photoUrl = user.photoURL;
            emailVerified = user.emailVerified;
            uid = user.uid; 


        }
    }
});

// Logout function
$('.login').on('click', function(event) {
    event.preventDefault();
    firebase.auth().signOut().then(function() {
        window.location.reload()
        console.log('sign out success')
    }).catch(function(error) {
        // An error happened.
    });

});


// -------------------------Need to add forgot password-------------------------//
// var auth = firebase.auth();
// var emailAddress = "user@example.com";

// auth.sendPasswordResetEmail(emailAddress).then(function() {
//   // Email sent.
// }, function(error) {
//   // An error happened.
// });
// -------------------------END Need to add forgot password-------------------------//
