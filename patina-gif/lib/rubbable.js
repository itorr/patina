/*
	RubbableGif

	Example usage:

		<img src="./example1_preview.gif" rel:animated_src="./example1.gif" width="360" height="360" rel:auto_play="1" />

		<script type="text/javascript">
			$$('img').each(function (img_tag) {
				if (/.*\.gif/.test(img_tag.src)) {
					var rub = new RubbableGif({ gif: img_tag } );
					rub.load();
				}
			});
		</script>

	Image tag attributes:

		rel:animated_src -	If this url is specified, it's loaded into the player instead of src.
							This allows a preview frame to be shown until animated gif data is streamed into the canvas

		rel:auto_play -		Defaults to 1 if not specified. If set to zero, the gif will be rubbable but will not 
							animate unless the user is rubbing it.

	Constructor options args

		gif 				Required. The DOM element of an img tag.
		auto_play 			Optional. Same as the rel:auto_play attribute above, this arg overrides the img tag info.
		max_width			Optional. Scale images over max_width down to max_width. Helpful with mobile.

	Instance methods

		// loading
		load( callback )	Loads the gif into a canvas element and then calls callback if one is passed

		// play controls
		play -				Start playing the gif
		pause -				Stop playing the gif
		move_to(i) -		Move to frame i of the gif
		move_relative(i) -	Move i frames ahead (or behind if i < 0)

		// getters
		get_canvas			The canvas element that the gif is playing in.
		get_playing			Whether or not the gif is currently playing
		get_loading			Whether or not the gif has finished loading/parsing
		get_auto_play		Whether or not the gif is set to play automatically
		get_length			The number of frames in the gif
		get_current_frame	The index of the currently displayed frame of the gif

		For additional customization (viewport inside iframe) these params may be passed:
		c_w, c_h - width and height of canvas
		vp_t, vp_l, vp_ w, vp_h - top, left, width and height of the viewport

*/
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
      define(['./libgif'], factory);
  } else if (typeof exports === 'object') {
      module.exports = factory(require('./libgif'));
  } else {
      root.RubbableGif = factory(root.SuperGif);
  }
}(this, function (SuperGif) {
  var RubbableGif = function( options ) {
      var sup = new SuperGif( options );

      var register_canvas_handers = function () {

          var isvp = function(x) {
              return (options.vp_l ? ( x - options.vp_l ) : x );
          }

          var canvas = sup.get_canvas();
          var maxTime = 1000,
          // allow movement if < 1000 ms (1 sec)
              w = ( options.vp_w ? options.vp_w : canvas.width ),
              maxDistance = Math.floor(w / (sup.get_length() * 2)),
          // swipe movement of 50 pixels triggers the swipe
              startX = 0,
              startTime = 0;

          var cantouch = "ontouchend" in document;

          var aj = 0;
          var last_played = 0;

          canvas.addEventListener((cantouch) ? 'touchstart' : 'mousedown', function (e) {
              // prevent image drag (Firefox)
              e.preventDefault();
              if (sup.get_auto_play()) sup.pause();

              var pos = (e.touches && e.touches.length > 0) ? e.touches[0] : e;

              var x = (pos.layerX > 0) ? isvp(pos.layerX) : w / 2;
              var progress = x / w;

              sup.move_to( Math.floor(progress * (sup.get_length() - 1)) );

              startTime = e.timeStamp;
              startX = isvp(pos.pageX);
          });

          canvas.addEventListener((cantouch) ? 'touchend' : 'mouseup', function (e) {
              startTime = 0;
              startX = 0;
              if (sup.get_auto_play()) sup.play();
          });

          canvas.addEventListener((cantouch) ? 'touchmove' : 'mousemove', function (e) {
              e.preventDefault();
              var pos = (e.touches && e.touches.length > 0) ? e.touches[0] : e;

              var currentX = isvp(pos.pageX);
              currentDistance = (startX === 0) ? 0 : Math.abs(currentX - startX);
              // allow if movement < 1 sec
              currentTime = e.timeStamp;
              if (startTime !== 0 && currentDistance > maxDistance) {
                  if (currentX < startX && sup.get_current_frame() > 0) {
                      sup.move_relative(-1);
                  }
                  if (currentX > startX && sup.get_current_frame() < sup.get_length() - 1) {
                      sup.move_relative(1);
                  }
                  startTime = e.timeStamp;
                  startX = isvp(pos.pageX);
              }

              var time_since_last_play = e.timeStamp - last_played;
              {
                  aj++;
                  if (document.getElementById('tickles' + ((aj % 5) + 1))) document.getElementById('tickles' + ((aj % 5) + 1)).play();
                  last_played = e.timeStamp;
              }


          });
      };

      sup.orig_load = sup.load;
      sup.load = function(callback) {
          sup.orig_load( function() {
              if (callback) callback();
              register_canvas_handers( sup );
          } );
      }

      return sup;
  }

  return RubbableGif;
}));