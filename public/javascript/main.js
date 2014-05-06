// Initial code by Borui Wang, updated by Graham Roth
// For CS247, Spring 2014

(function() {

  var cur_video_blob = null;
  var fb_instance;

  $(document).ready(function(){
    connect_to_chat_firebase();
    // connect_webcam();
  });

  function connect_to_chat_firebase(){
    /* Include your Firebase link here!*/
    fb_instance = new Firebase("https://amber-fire-5565.firebaseio.com/");

    // generate new chatroom id or use existing id
    var url_segments = document.location.href.split("/#");
    if(url_segments[1]){
      fb_chat_room_id = url_segments[1];
    }else{
      fb_chat_room_id = Math.random().toString(36).substring(7);
    }
    display_msg({m:"Share this url with your friend to join this chat: "+ document.location.origin+"/#"+fb_chat_room_id,c:"red"})

    // set up variables to access firebase data structure
    var fb_new_chat_room = fb_instance.child('chatrooms').child(fb_chat_room_id);
    var fb_instance_users = fb_new_chat_room.child('users');
    var fb_instance_stream = fb_new_chat_room.child('stream');
    var my_color = "#"+((1<<24)*Math.random()|0).toString(16);

    // listen to events
    fb_instance_users.on("child_added",function(snapshot){
      display_msg({m:snapshot.val().name+" joined the room",c: snapshot.val().c});
    });
    fb_instance_stream.on("child_added",function(snapshot){
      display_msg(snapshot.val());
    });

    // block until username is answered
    var username = "";//window.prompt("Welcome, warrior! please declare your name?");
    if(!username){
      username = "anonymous"+Math.floor(Math.random()*1111);
    }
    fb_instance_users.push({ name: username,c: my_color});
    $("#waiting").remove();

    // bind submission box
    $("#submission input").keydown(function( event ) {
      if (event.which == 13) {
        // if(has_emotions($(this).val())){
        //   fb_instance_stream.push({m:username+": " +$(this).val(), v:cur_video_blob, c: my_color});
        // }else{
        //   fb_instance_stream.push({m:username+": " +$(this).val(), c: my_color});
        // }
        fb_instance_stream.push({m:username+": " +$(this).val(), c: my_color});
        $(this).val("");
        scroll_to_bottom(0);
      }
    });

    // scroll to bottom in case there is already content
    scroll_to_bottom(1300);
  }

  // creates a message node and appends it to the conversation
  function display_msg(data){
    $("#conversation").append("<div class='msg' style='color:"+data.c+"'>"+data.m+"</div>");
    // if(data.v){
    //   // for video element
    //   var video = document.createElement("video");
    //   video.autoplay = true;
    //   video.controls = false; // optional
    //   video.loop = true;
    //   video.width = 120;

    //   var source = document.createElement("source");
    //   source.src =  URL.createObjectURL(base64_to_blob(data.v));
    //   source.type =  "video/webm";

    //   video.appendChild(source);

    //   // for gif instead, use this code below and change mediaRecorder.mimeType in onMediaSuccess below
    //   // var video = document.createElement("img");
    //   // video.src = URL.createObjectURL(base64_to_blob(data.v));

    //   document.getElementById("conversation").appendChild(video);
    // }
  }

  function scroll_to_bottom(wait_time){
    // scroll to bottom of div
    setTimeout(function(){
      $("html, body").animate({ scrollTop: $(document).height() }, 200);
    },wait_time);
  }

  // function connect_webcam(){
  //   // we're only recording video, not audio
  //   var mediaConstraints = {
  //     video: true,
  //     audio: false
  //   };

  //   // callback for when we get video stream from user.
  //   var onMediaSuccess = function(stream) {
  //     // create video element, attach webcam stream to video element
  //     var video_width= 160;
  //     var video_height= 120;
  //     var webcam_stream = document.getElementById('webcam_stream');
  //     var video = document.createElement('video');
  //     webcam_stream.innerHTML = "";
  //     // adds these properties to the video
  //     video = mergeProps(video, {
  //         controls: false,
  //         width: video_width,
  //         height: video_height,
  //         src: URL.createObjectURL(stream)
  //     });
  //     video.play();
  //     webcam_stream.appendChild(video);

  //     // counter
  //     var time = 0;
  //     var second_counter = document.getElementById('second_counter');
  //     var second_counter_update = setInterval(function(){
  //       second_counter.innerHTML = time++;
  //     },1000);

  //     // now record stream in 5 seconds interval
  //     var video_container = document.getElementById('video_container');
  //     var mediaRecorder = new MediaStreamRecorder(stream);
  //     var index = 1;

  //     mediaRecorder.mimeType = 'video/webm';
  //     // mediaRecorder.mimeType = 'image/gif';
  //     // make recorded media smaller to save some traffic (80 * 60 pixels, 3*24 frames)
  //     mediaRecorder.video_width = video_width/2;
  //     mediaRecorder.video_height = video_height/2;

  //     mediaRecorder.ondataavailable = function (blob) {
  //         //console.log("new data available!");
  //         video_container.innerHTML = "";

  //         // convert data into base 64 blocks
  //         blob_to_base64(blob,function(b64_data){
  //           cur_video_blob = b64_data;
  //         });
  //     };
  //     setInterval( function() {
  //       mediaRecorder.stop();
  //       mediaRecorder.start(3000);
  //     }, 3000 );
  //     console.log("connect to media stream!");
  //   }

  //   // callback if there is an error when we try and get the video stream
  //   var onMediaError = function(e) {
  //     console.error('media error', e);
  //   }

  //   // get video stream from user. see https://github.com/streamproc/MediaStreamRecorder
  //   navigator.getUserMedia(mediaConstraints, onMediaSuccess, onMediaError);
  // }

  // check to see if a message qualifies to be replaced with video.
  var has_emotions = function(msg){
    var options = ["lol",":)",":("];
    for(var i=0;i<options.length;i++){
      if(msg.indexOf(options[i])!= -1){
        return true;
      }
    }
    return false;
  }


  // some handy methods for converting blob to base 64 and vice versa
  // for performance bench mark, please refer to http://jsperf.com/blob-base64-conversion/5
  // note useing String.fromCharCode.apply can cause callstack error
  var blob_to_base64 = function(blob, callback) {
    var reader = new FileReader();
    reader.onload = function() {
      var dataUrl = reader.result;
      var base64 = dataUrl.split(',')[1];
      callback(base64);
    };
    reader.readAsDataURL(blob);
  };

  var base64_to_blob = function(base64) {
    var binary = atob(base64);
    var len = binary.length;
    var buffer = new ArrayBuffer(len);
    var view = new Uint8Array(buffer);
    for (var i = 0; i < len; i++) {
      view[i] = binary.charCodeAt(i);
    }
    var blob = new Blob([view]);
    return blob;
  };

})();

// This is called with the results from from FB.getLoginStatus().
  function statusChangeCallback(response) {
    console.log('statusChangeCallback');
    console.log(response);
    // The response object is returned with a status field that lets the
    // app know the current login status of the person.
    // Full docs on the response object can be found in the documentation
    // for FB.getLoginStatus().
    if (response.status === 'connected') {
      // Logged into your app and Facebook.
      testAPI();
    } else if (response.status === 'not_authorized') {
      // The person is logged into Facebook, but not your app.
      document.getElementById('status').innerHTML = 'Please log ' +
        'into this app.';
    } else {
      // The person is not logged into Facebook, so we're not sure if
      // they are logged into this app or not.
      document.getElementById('status').innerHTML = 'Please log ' +
        'into Facebook.';
    }
  }

  // This function is called when someone finishes with the Login
  // Button.  See the onlogin handler attached to it in the sample
  // code below.
  function checkLoginState() {
    FB.getLoginStatus(function(response) {
      statusChangeCallback(response);
    });
  }

  window.fbAsyncInit = function() {
  FB.init({
    appId      : '241659929360119',
    cookie     : true,  // enable cookies to allow the server to access 
                        // the session
    xfbml      : true,  // parse social plugins on this page
    version    : 'v2.0' // use version 2.0
  });

  // Now that we've initialized the JavaScript SDK, we call 
  // FB.getLoginStatus().  This function gets the state of the
  // person visiting this page and can return one of three states to
  // the callback you provide.  They can be:
  //
  // 1. Logged into your app ('connected')
  // 2. Logged into Facebook, but not your app ('not_authorized')
  // 3. Not logged into Facebook and can't tell if they are logged into
  //    your app or not.
  //
  // These three cases are handled in the callback function.

  FB.getLoginStatus(function(response) {
    statusChangeCallback(response);
  });

  };

  // Load the SDK asynchronously
  (function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s); js.id = id;
    js.src = "https://connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
  }(document, 'script', 'facebook-jssdk'));

  // Here we run a very simple test of the Graph API after login is
  // successful.  See statusChangeCallback() for when this call is made.
  function testAPI() {
    console.log('Welcome!  Fetching your information.... ');
    FB.api('/me', function(response) {
      console.log('Good to see you, ' + response.name + '.');
      document.getElementById('status').innerHTML = 'Good to see you, ' +
        response.name;
      // username = response.name;
    });
    // FB.api('/me/statuses?limit=1', function(response) {
    //   console.log(JSON.stringify(response));
    // });
    FB.api('/me/photos?limit=1&fields=name,source,link', function(response) {
      var pic = response["data"][0];
      console.log(JSON.stringify(pic));
      $('#sparkPhoto').append('<img src="'+pic["source"]+'"" class="fit_spark"><br/>');
      $('#sparkPhoto').append('<a href="'+pic["link"]+'"">'+pic["name"]+"</a>");
    });
    FB.api('/me/videos?limit=1&fields=id,name', function(response) {
      var video = response["data"][0];
      console.log(JSON.stringify(video));
      $("#sparkVideo").append('<iframe src="https://www.facebook.com/video/embed?video_id='+video["id"]+'" height="130" frameborder="0"></iframe><br/>');
      $('#sparkVideo').append('<a href="https://www.facebook.com/video/embed?video_id='+video["id"]+'">'+video["name"]+"</a>");
    });
    // FB.api('/me/tagged_places?limit=1', function(response) {
    //   console.log(JSON.stringify(response));
    // });
  }
