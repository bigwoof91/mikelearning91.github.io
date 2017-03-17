// firebase connection
var config = {
    apiKey: "AIzaSyBrINciYykzgm93-J0NsRSLADGwsjUQREU",
    authDomain: "moodu-c5856.firebaseapp.com",
    databaseURL: "https://moodu-c5856.firebaseio.com",
    storageBucket: "moodu-c5856.appspot.com",
    messagingSenderId: "461647702901"
};

firebase.initializeApp(config);

var database = firebase.database();
var uid;

// rules, conditions, fetching for input values
firebase.auth().onAuthStateChanged(function(user) {
    // if user is not logged in then redirect to login.html
    if (!user) {
        window.location.href = 'login.html';
    }
    // fetching database for input values
    if (user) {
        var user = firebase.auth().currentUser;
        var name, email, photoUrl, uid, emailVerified;
        var userId = user.uid

        firebase.database().ref('temp/users/' + userId).on('value', function(snapshot) {
            var hikingTrue = snapshot.val().hiking;
            console.log("hiking: " + hikingTrue);

            if (hikingTrue == true) {
                $('#hiking').addClass('active');
            }
        });
        // populate display name and email/username inputs current firebase auth details
        if (user != null) {
            name = user.displayName;
            email = user.email;
            photoUrl = user.photoURL;
            emailVerified = user.emailVerified;
            uid = user.uid;

            $('#email').val(email);
            $('#displayName').val(name);
        }
    }
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

// saving input values to firebase database 
$('#saveProfile').on('click', function(e) {
    e.preventDefault();
    // Update logged in user's profile info
    var user = firebase.auth().currentUser;
    var newName = $('#displayName').val().trim();
    var newEmail = $('#email').val().trim();
    var userId = user.uid;
    var hiking = $('#hiking').hasClass('active');

    user.updateProfile({
        displayName: newName,
    }).then(function() {
        console.log('Updated display name successfully')
    }, function(error) {
        // An error happened.
    });

    user.updateEmail(newEmail).then(function() {
        console.log('Updated email successfully')
        $(".savedText").css('left', '18%').animate({ opacity: '.7'}, 2000);
        $(".savedText").animate({ opacity: '0' }, 500);

    }, function(error) {
        // An error happened.
    });
    // storing new user-selected-input data to firebase database
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            console.log(user.uid);
            uid = user.uid;
            // stores user to database
            newUserInfo = {
                name: newName,
                email: newEmail,
                hiking: hiking
            };
            var newRef = database.ref('temp/users/' + uid + '/').set(newUserInfo);
        }
    });

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

// Hide Footer {
$('.footer').hide();
$('header').css('background', '#fff');
$('.logo-title').css('color', '#17baef');

// ------------------------- START Need to add forgot password (no mail server) -------------------------//
// var auth = firebase.auth();
// var emailAddress = "user@example.com";

// auth.sendPasswordResetEmail(emailAddress).then(function() {
//   // Email sent.
// }, function(error) {
//   // An error happened.
// });
// ------------------------- END Need to add forgot password (no mail server) -------------------------//
