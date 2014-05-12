// Initial code by Borui Wang, updated by Graham Roth
// For CS247, Spring 2014
var username;

var sparksImagesTemplate = document.getElementById('sparks-images-template');
var sparksVideosTemplate = document.getElementById('sparks-videos-template');
var sparksTextTemplate = document.getElementById('sparks-text-template');

 var templates = {
        renderSparksImages: Handlebars.compile(sparksImagesTemplate.innerHTML),
        renderSparksVideos: Handlebars.compile(sparksVideosTemplate.innerHTML),
        renderSparksText: Handlebars.compile(sparksTextTemplate.innerHTML)
 };

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
    username = "";//window.prompt("Welcome, warrior! please declare your name?");
    if(!username){
      username = "anonymous"+Math.floor(Math.random()*1111);
    }
    fb_instance_users.push({ name: username,c: my_color});
    $("#waiting").remove();

    $('.cont').click(function(){
      var htmlString = $(this).html().substring($(this).html().indexOf('</h4>')+5, $(this).html().indexOf("<br"));
      console.log($(this).html().substring($(this).html().indexOf('</h4>')+5, $(this).html().indexOf("<br")));
      fb_instance_stream.push({m:username+": <br/><br/>" + htmlString, c: my_color});
      $('#sparkers').animate({opacity: 0}, 500);
      $('#sparkers').hide();
    });

    // bind submission box
    $("#submission input").keydown(function( event ) {
      if (event.which == 13) {
        fb_instance_stream.push({m:username+": " +$(this).val(), c: my_color});
        $(this).val("");
        scroll_to_bottom(0);
      }
    });

    // scroll to bottom in case there is already content
    scroll_to_bottom(1300);
    $('#sparkers').animate({opacity: 0}, 500);
    $('#sparkers').hide();
  }

  // creates a message node and appends it to the conversation
  function display_msg(data){
    $("#conversation").append("<div class='msg' style='color:"+data.c+"'>"+data.m+"</div>");
    // console.log(username);
    if (data.m.indexOf(username) != 0 && has_spark(data.m)){
      $('#sparkers').animate({opacity: 1}, 500);
      $('#sparkers').show();
    }
    else if (data.m.indexOf(username) === 0 && data.m.indexOf("#show") != -1) {
      $('#sparkers').animate({opacity: 1}, 500); 
      $('#sparkers').show();
    }
   
  }

  function scroll_to_bottom(wait_time){
    // scroll to bottom of div
    setTimeout(function(){
      $("html, body").animate({ scrollTop: $(document).height() }, 200);
    },wait_time);
  }


  // check to see if a message qualifies to be replaced with video.
  var has_spark = function(msg){
    var options = ["it going?","re you doing?","s up?", "how are you?", "what's new?", "tell me everything", "sup?"];
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
      // console.log('Good to see you, ' + response.name + '.');
      document.getElementById('status').innerHTML = 'Good to see you, ' +
        response.name;
      // username = response.name;
    });

    // ***create sparks***
    //Tagged photo
    FB.api('/me/photos?limit=5&fields=name,source,link', function(response) {
      $('#sparkPhoto').html(templates.renderSparksImages({
          sparkName: "Photo Tagged",
          sparks: response["data"],
        }));
    });

    //uploaded photos
     FB.api('/me/photos/uploaded?limit=5&fields=name,source,link', function(response) {
      $('#sparkPhotoUp').html(templates.renderSparksImages({
          sparkName: "Photos Uploaded",
          sparks: response["data"],
        }));
    });

     //uploaded videos
    FB.api('/me/videos?limit=3&fields=id,name,from', function(response) {
      $('#sparkVideo').html(templates.renderSparksVideos({
          sparkName: "Videos Uploaded",
          sparks: response["data"],
      }));
    });

    //Statuses
    FB.api('/me/statuses?limit=5&fields=id,message,from', function(response) {
      var status = response["data"][0];
      console.log("statuses data: " + response["data"]); // THIS ALWAYS RETURNS EMPTY???

      $('#sparkStatus').html(templates.renderSparksText({
          sparkName: "Statuses",
          sparks: response["data"],
      }));

      //$('#sparkStatus').append('<a href="https://www.facebook.com/'+status["from"]["id"]+'_'+status["id"]+'">'+status["message"]+"</a>");
    });

    //Likes
    FB.api('/me/likes?limit=5&fields=id,name', function(response) {
      var likes = response["data"];
      var sparkData = [];
      //for each like, find the img url 
      for (var i = 0; i < likes.length; i++) {
        FB.api('/'+likes[i]["id"]+'/picture?redirect=false&height=140', (function(sparkData, like) {
            return function(response) {
              sparkData.push( {
                source: response["data"]["url"],
                link: "https://www.facebook.com/" + like["id"]
              })

              //because of async, put this here hoping they all finish
              if (sparkData.length > 4) {
                 $('#sparkLike').html(templates.renderSparksImages({
                     sparkName: "Likes",
                    sparks: sparkData,
                  }));
              }
            }
          })(sparkData, likes[i])
        );
      }
    });
    

    FB.api('/me/tagged_places?limit=1', function(response) {
      var tagged_place = response["data"][0];
      
      var map = new GMap2(document.getElementById("map"));
      map.setCenter(new GLatLng(tagged_place["place"]["location"]["latitude"], tagged_place["place"]["location"]["longitude"]), 16);

      $('#maplink').attr("href", "https://www.facebook.com/"+tagged_place["place"]["id"]);
    });
    
    $('#sparkers').css({opacity: 1});
    $('#sparkers').show();
    
    setTimeout(function(){
      
    }, 500);
    $('#fb_button').hide();

  }
