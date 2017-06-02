$(document)
  .ready(function () {
    $('.button-collapse').sideNav({
      menuWidth: 250, // Default is 300
      edge: 'left', // Choose the horizontal origin
      closeOnClick: true, // Closes side-nav on <a> clicks, useful for Angular/Meteor
      draggable: true // Choose whether you can drag to open on touch screens
    });
    $('.popup-overlay, .close-area, .close-btn').click(function () {
      $('.popup, .popup-overlay').addClass('hide');
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
    var currentTimer = null;

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
        database.ref('onlineUsers/' + window.userPeerID).remove();
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
                // console.log("Sign-in provider: " + profile.providerId);
                // console.log("  Provider-specific UID: " + profile.uid);
                // console.log("  Name: " + profile.displayName);
                // console.log("  Email: " + profile.email);
                // console.log("  Photo URL: " + profile.photoURL);
              });

            var messages = [],
              my_id = shortid.gen(),
              peer_id, name, conn;
              window.userPeerID = my_id;

            var connectedRef = firebase.database().ref(".info/connected");
            var presenceRef = database.ref('presence');
            var userRef = database.ref('presence/' + auth.currentUser.uid);
            var onlineUser = database.ref('onlineUsers/' + my_id);
            connectedRef.on('value', function (snap) {
              if (snap.val()) {
                userRef.onDisconnect().remove();
                onlineUser.onDisconnect().remove();
                var userEmail = user.email;
                var displayName = user.displayName;
                var photoURL = user.photoURL;
                userRef.set({
                  name: displayName,
                  id: my_id,
                  email: userEmail,
                  photoURL
                });
                onlineUser.set({
                  name: displayName,
                  photoURL
                });

                presenceRef.on('value', function (snap) {
                  $('#slide-out').html('');
                  snap.forEach(function (childSnap) {
                    var userData = childSnap.val();
                    var userKey = childSnap.key;

                    if (userData !== null) {
                      var userEmail = userData.email || "";
                      var userID = userData.id || "";
                      var userName = userData.name || "";
                      var userPic = userData.photoURL || "";
                    }

                    var toDisplay = "";
                    toDisplay += "<li id=\"" + userID + "\" class=\"" + userName + "\">";
                    toDisplay += "\t<a href= \"#!\" class=\"waves-effect\">";
                    toDisplay += "\n\t\t<span class=\"status green\"></span>";
                    toDisplay += "\n\t\t<img src=\"" + userPic + "\" alt=\"" + userEmail + "\" class=\"circle online\">";
                    toDisplay += "\n\t\t<span class=\"name\">" + userName + "</span>";
                    toDisplay += "\n\t\t<br><small class=\"email\">" + userEmail + "</small>";
                    toDisplay += "\n\t</a>";
                    toDisplay += "\n</li>";

                    $('#slide-out').append(toDisplay);

                    $('#slide-out li').bind('click', function (e) {
                      if (!currentTimer) {
                        currentTimer = true;
                        setTimeout(function () {
                          if (currentTimer) {
                            currentTimer = null;

                            var sureToMakeCall = confirm("Click \"OK\" to make call to " + e.currentTarget.className + " ");
                            if (sureToMakeCall) {
                              if (userID != my_id) {
                                console.log("initiating call to  user with ID " + e.currentTarget.id);
                                peer_id = e.currentTarget.id;
                                name = e.currentTarget.className;

                                var call = peer.call(peer_id, window.localStream);

                                call.on('stream', function(stream) {
                                  window.peer_stream = stream;
                                  onRecieveStream(stream, 'him');
                                });

                                conn = peer.connect(peer_id, {
                                  metadata: {
                                    'username': name
                                  }
                                });
                                conn.on('data', handleMessage);
                              } else {
                                alert("Sorry, you can't make a call to yourself");
                              }
                            } else {
                              console.log("call attempt to " + e.currentTarget.id + " cancelled");
                            }
                          }
                        }, 200);
                      }
                    });
                  });
                });
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

            peer.on('connection', function (connection) {
              conn = connection;
              peer_id = connection.peer;
              conn.on('data', handleMessage);
            });

            peer.on('call', function(call){
              var caller = call.peer, caller_data = firebase.database().ref('onlineUsers/' + call.peer);
              caller_data.on('value', function(snap){
                var caller_name = snap.val().name, caller_pic = snap.val().photoURL;
                $('.caller-displayName').text();
                $('img.caller-pic').attr('src', caller_pic);
              });
              $('#call-popup, #call-popup .popup-overlay').removeClass('hide');
              $('#accept-call').click(function(){
                onRecieveCall(call);
                $('.popup, .popup-overlay').addClass('hide');
              });
              $('#reject-call').click(function(){
                $('.popup, .popup-overlay').addClass('hide');
              });
              // onRecieveCall(call);
            });

            function onRecieveCall(call){
              call.answer(window.localStream);
              call.on('stream', function(stream){
                window.peer_stream = stream;
                onRecieveStream(stream, 'him')
              });
            }

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

            function handleMessage(data) {
              messages.push(data);

              // ...TODO
            }

            function sendMessage() {
              var text = $('#message').val();
              var data = {
                'from': name,
                'text': text
              };

              conn.send(data);
              handleMessage(data);
              $('#message').val('');
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