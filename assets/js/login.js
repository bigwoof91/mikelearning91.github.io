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
var database = firebase.database();
var newUser;
var uid = "";
// Store user data on sign up
//Get the firebase reference    

// sign up, add user to firebase and store to database
$('#signUpNow').on('click', function(event) {
    event.preventDefault();
    clearSignupError();
    email = $('#username').val().trim();
    password = $('#password').val().trim();

    // Adds/authenticates new user to firebase/app
    firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
        console.log(error.code);
        console.log(error.message);
        showSignupError();

    });
    console.log(email);
    console.log(password);

    // redirects user to profile
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            // user uid to user as user name/key (uid is used as parent node for user details)
            console.log(user.uid);
            uid = user.uid;
            console.log(uid);
            // stores user to database
            newUser = {
                email: email
            };
            var newRef = database.ref('temp/users/' + uid + '/').set(newUser);

            window.location = 'profile.html';
        }
    });
});

// Login and redirect
$('#loginNow').on('click', function(event) {
    event.preventDefault();
    clearLoginError();
    email = $('#usernameLogin').val().trim();
    password = $('#passwordLogin').val().trim();

    firebase.auth().signInWithEmailAndPassword(email, password).then(function(result) {
        firebase.auth().onAuthStateChanged(user => {
            if (user) {
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

// rules for if user is/isn't logged in
firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        $('.login').attr('href', 'index.html').html('Logout');
        $('.login').on('click', function(event) {
            event.preventDefault();
            firebase.auth().signOut().then(function() {
                window.location.reload()
                console.log('sign out success')
            }).catch(function(error) {
                // An error happened.
            });

        });
    }
    if (!user) {
        $('#appNavItem').hide();
        $('#profileNavItem').hide();
    }
});

// if user attempts to go to login.html user will be redirected to profile page
if (window.location.pathname == '/login.html') {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            window.location = 'profile.html';
        }
    });
};

// if on index page, redirect to profile page if user clicks on login/signup modal buttons
if (window.location.pathname == '/index.html') {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            $('.to-modal').on('click', function(event) {
                event.preventDefault();
                window.location = 'profile.html';
            });
        }
    });
};

// -------------------------Need to add forgot password-------------------------//
// var auth = firebase.auth();
// var emailAddress = "user@example.com";

// auth.sendPasswordResetEmail(emailAddress).then(function() {
//   // Email sent.
// }, function(error) {
//   // An error happened.
// });
// -------------------------END Need to add forgot password-------------------------//
