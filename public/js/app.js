$(document)
  .ready(function () {
    $('.button-collapse').sideNav({
      menuWidth: 250, // Default is 300
      edge: 'left', // Choose the horizontal origin
      closeOnClick: true, // Closes side-nav on <a> clicks, useful for Angular/Meteor
      draggable: true // Choose whether you can drag to open on touch screens
    });

    var config = {
      apiKey: "AIzaSyCAcdVtoFPq8jrMpSNDYI_la5rA9SoFx84",
      authDomain: "peer2talk.firebaseapp.com",
      databaseURL: "https://peer2talk.firebaseio.com",
      projectId: "peer2talk",
      storageBucket: "peer2talk.appspot.com",
      messagingSenderId: "502580489866"
    };
    firebase.initializeApp(config);

    var auth = firebase.auth();
    var database = firebase.database();

    const userListRef = firebase.database().ref("USERS_ONLINE");
    const myUserRef = userListRef.push();

    // firebase.database().ref(".info/connected")
    //   .on(
    //     "value",
    //     function (snap) {
    //       if (snap.val()) {
    //         // if we lose network then remove this user from the list
    //         userListRef.push(auth.currentUser.id);
    //         console.log(auth.currentUser.id);
    //         myUserRef.onDisconnect()
    //           .remove();
    //         // set user's online status
    //         setUserStatus("online");
    //       } else {
    //         // client has lost network
    //         setUserStatus("offline");
    //       }
    //     }
    //   );



    function toggleSignin() {
      if (!auth.currentUser) {
        var provider = new firebase
          .auth
          .GoogleAuthProvider();
        // provider.addScope('https://www.googleapis.com/auth/plus.login');

        auth
          .signInWithPopup(provider)
          .then(function (result) {
            // This gives you a Google Access Token. You can use it to access the Google
            // API.
            var token = result.credential.accessToken;
            // The signed-in user info.
            var user = result.user;
            // ...
          })
          .catch(function (error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            // The email of the user's account used.
            var email = error.email;
            // The firebase.auth.AuthCredential type that was used.
            var credential = error.credential;
            // ...
            Materialize.toast(errorMessage, 5000, 'rounded');
          });
      } else {
        database.ref('presence/' + auth.currentUser.uid).remove();
        auth
          .signOut()
          .then(function () {
            // Sign-out successful.
            Materialize.toast('Sign out Successful', 3000, 'rounded');
          })
          .catch(function (error) {
            // An error happened.
            Materialize.toast(error.message, 5000, 'rounded');
          });
      }
    }

    auth
      .onAuthStateChanged(function (user) {
        if (user) {
          // User is signed in.
          $('#signG').text('sign out');
          $('body').removeClass('stranger');
          $('#auth_splash').addClass('hide');
          $('main#app').removeClass('hide');
          if (user !== null) {
            user
              .providerData
              .forEach(function (profile) {
                console.log("Sign-in provider: " + profile.providerId);
                console.log("  Provider-specific UID: " + profile.uid);
                console.log("  Name: " + profile.displayName);
                console.log("  Email: " + profile.email);
                console.log("  Photo URL: " + profile.photoURL);
              });

            var messages = [];
            var my_id = shortid.gen();

            var connectedRef = firebase.database().ref(".info/connected");
            var presenceRef = database.ref('presence');
            var userRef = database.ref('presence/' + auth.currentUser.uid);
            connectedRef.on('value', function(snap) {
              if (snap.val()) {
                userRef.onDisconnect().remove();
                var userEmail = user.email;
                var displayName = user.displayName;
                userRef.set({ name: displayName, id: my_id, email: userEmail });

                presenceRef.on('value', function(snap){
                  var users = snap.val();
                  console.log(users);
                })
              }
            });

            var peer_id,
              name,
              conn;

            var peer = new Peer(my_id, {
              host: window.location.hostname,
              port: window.location.port,
              path: '/peerjs',
              debug: 3,
              config: {
                'iceServers': [{
                  url: 'stun:stun1.l.google.com:19302'
                }, {
                  url: 'turn:numb.viagenie.ca',
                  credential: 'muazkh',
                  username: 'webrtc@live.com'
                }]
              }
            });

            peer.on('open', function () {
              // do something when peer is initialized
            });

            navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

            function getVideo(callback) {
              navigator.getUserMedia({
                audio: true,
                video: true
              }, callback, function (error) {
                console.log(error);
                alert('An error occured. Please try again');
              });
            }

            getVideo(function (stream) {
              window.localStream = stream;
              onRecieveStream(stream, 'me');
            });

            function onRecieveStream(stream, element_id) {
              var video = $('#' + element_id)[0];
              video.src = window.URL.createObjectURL(stream);
              window.peer_stream = stream;
            }
          }
        } else {
          // No user is signed in.
          $('#signG').text('Register or Signin with Google');
          $('body').addClass('stranger');
          $('#auth_splash').removeClass('hide');
          $('main#app').addClass('hide');
        }
      });
    // var user = firebase.auth().currentUser; if (user) {   // User is signed in. }
    // else {   // No user is signed in. }

    $('.signG').click(function () {
      toggleSignin();
    });

  });