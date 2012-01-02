// Define Vars;
var is_typing_currently = false;
var browser_audio_type = "";

$(document).ready(function()
{
	
	var audio = document.createElement("audio");
	var audio_types = ["ogg", "mpeg", "wav"];
	// Loop through the types I have and break out when the browser says it might be able to play one
	if (typeof audio.canPlayType == 'function') {
  	for(type in audio_types) {
  		var type_name = audio_types[type];
  		if(audio.canPlayType("audio/" + type_name) == "yes" || audio.canPlayType("audio/" + type_name) == "maybe") {
  			browser_audio_type = type_name;
  			break;
  		}
  	}
	}

	// Logging - Disable in production
	// Pusher.log = function() { if (window.console) window.console.log.apply(window.console, arguments); };
	
	Pusher.channel_auth_endpoint = '/api/authenticate?user_id=' + user_id;
	var socket = new Pusher(PUSHER_KEY);
	
	// Global variable "channel" is set in the view
	var presenceChannel = socket.subscribe('presence-' + channel);

	// Increment the number of people in the room when you successfully subscribe to the room
	presenceChannel.bind('pusher:subscription_succeeded', function(member_list){
		updateCount(member_list.count);
	})

	// When somebody joins, pop a note to tell the user
	presenceChannel.bind('pusher:member_added', function(member) {
		$('#messages').append('<li class="note"><strong>' + member.chat_user.nickname + '</strong> joined the chat.</li>');
		scrollToTheTop();
		updateCount(1);
	});
	
	// When somebody leaves, pop a note to tell the user
	presenceChannel.bind('pusher:member_removed', function(member) {
		$('#messages').append('<li class="note"><strong>' + member.chat_user.nickname + '</strong> left the chat.</li>');
		scrollToTheTop();
		updateCount(-1);
	});
	
	// When somebody updates their nickname, tell all the people including yourself
	presenceChannel.bind('updated_nickname', function(member) {
		if(member.user_id == user_id)
		{
			$('#messages').append('<li class="note">You have updated your nickname to <strong>' + member.nickname + '</strong>.</li>');
		}
		else
		{
			$('#messages').append('<li class="note"><strong>' + member.old_nickname + '</strong> updated their nickname to <strong>' + member.nickname + '</strong>.</li>');
		}
		scrollToTheTop();
	});

	// Deal with incoming messages!
	presenceChannel.bind('send_message', function(message) {
		
		var you = '';
		if(user_id == message.user.id) {
			you = 'you ';
			$('#message-overlay').fadeOut(150);
		} else {
			// If they have a typing message, hide it!
			$('#messages #is_typing_' + message.user.id).hide();
			
			// Do some alerting of the user
			if(!hasFocus) {

				// TODO: Update the page title
				document.title = "New Message! - Pusher Chat";

				// Programatically create an audio element and pop the user
				if(browser_audio_type != "") {
					var pop = document.createElement("audio");
					if(browser_audio_type == "mpeg") { pop.src = "/images/pop.mp4"; }
					else { pop.src = "/images/pop." + browser_audio_type }

					// Only if the browser is happy to play some audio, actually load and play it.
					if(pop.src != "") {
						pop.load();
						pop.play();
					}
				}
			}
			
		}
		
		$('#messages').append('<li class="' + you + 'just_added_id_' + message.id + '" style="display:none;"><strong>' + message.user.nickname + '</strong> said:<br />' + replaceURLWithHTMLLinks(message.message) + '</li>');
		$('#messages li.just_added_id_' + message.id).fadeIn();
		scrollToTheTop();
	});
	
	// Typing Messages
	presenceChannel.bind('typing_status', function(notification) {
		if(notification.user.id == user_id) return false;
		if(notification.status == "true") {
			$('#messages').append('<li class="note" id="is_typing_'+ notification.user.id +'"><strong>' + notification.user.nickname + '</strong> is typing...</li>');
		} else {
			$('#messages #is_typing_' + notification.user.id).remove();
		}
		scrollToTheTop();
	});
	
	// Now pusher is all setup lets let the user go wild!
	$('#loading').fadeOut();
	$('#message').removeAttr("disabled");
	scrollToTheTop();
	
	// Enter key to send message
	$('#message').keydown(function(e)
	{
		if (e.keyCode == 13) { send_message(); return false; }
	});

	// Typing Notifications
	// "is_currently_typing" is defined at the top of this file
	var timout_function = function() {
		is_typing_currently = false;
		typing_status(false);
	}
	var typing_end_timeout;
	$('#message').keyup(function()
	{
		// Clear the timeout to stop annoying notifications coming every time you clear the field
		clearTimeout(typing_end_timeout);
		if($(this).val() == '' && is_typing_currently) {
			// Has stopped typing by clearing the field
			typing_end_timeout = setTimeout(timout_function, 1500);
		} else {
			// If your not currently typing then send the notification
			if(!is_typing_currently) { is_typing_currently = true; typing_status(true); }
		}
	});
	
	var old_nickname = "";
	$('#editNickname').click(function()
	{
		$('#title').fadeOut(200);
		$('#nickname').fadeIn(200);
		$('#saveNickname').fadeIn(200);
		$(this).hide();
		old_nickname = $('#nickname').val();
		return false;
	});

	$('#saveNickname').click(function()
	{
		$('#nickname').attr("disabled", "disabled");
		
		if($('#nickname').val() != old_nickname) {
			$.post('/api/update_nickname/', { 'chat_id': chat_id, 'user_id': user_id, 'nickname': $('#nickname').val() }, function(response) {
				if(response != "SAVED")
				{
					alert("There was an error updating your nickname, please try again.");
				}
				$('#nickname').hide();
				$('#nickname').attr("disabled", "");
				$('#editNickname').fadeIn(200);
				$('#title').fadeIn(200);
				$('#saveNickname').hide();
			});
		} else {
			$('#nickname').hide();
			$('#nickname').attr("disabled", "");
			$('#editNickname').fadeIn(200);
			$('#title').fadeIn(200);
			$('#saveNickname').hide();
		}
		
		return false;
	});
	
	// Cross browser placeholder shiz
	var text = 'Type your message here and hit enter...';
	$('#message').focus(function() {
		if($(this).val() == text) { $(this).val(""); }
	}).blur(function() {
		if($(this).val() == "") { $(this).val(text); }
	});
	
});