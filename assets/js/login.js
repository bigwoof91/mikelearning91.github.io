// firebase connection
  var config = {
    apiKey: "AIzaSyBrINciYykzgm93-J0NsRSLADGwsjUQREU",
    authDomain: "moodu-c5856.firebaseapp.com",
    databaseURL: "https://moodu-c5856.firebaseio.com",
    storageBucket: "moodu-c5856.appspot.com",
    messagingSenderId: "461647702901"
  };

firebase.initializeApp(config);




$('#loginNow').on('click', function(event) {
  event.preventDefault;
  const email = $('#username').val().trim();
  const pass = $('#password').val().trim();
  console.log(username);

    const auth = firebase.auth();
    auth.createUserWithEmailAndPassword(username, pass);
      console.log(username);
      console.log(password);

    });

