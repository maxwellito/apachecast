/**
 * CHROMECAST ***************************************************************
 *
 * In these method, the object `console` is used, quite often.
 * But this code can only be executed in a Chrome environment,
 * so the `console` object will be available and won't break
 * the code.
 *
 * This part of the code is still in beta test, the log will
 * be used to debug the script if necessary.
 */

/**
 * Init the Chromecast to check if the API is available
 * and get the necessary IDs
 *
 */
function initChromecast() {
  // Avoid init if window.chromecaster is declared
  if (window.chromecaster) {
    return;
  }

  // Listener setup for when the chromecast is available
  window['__onGCastApiAvailable'] = function (loaded, errorInfo) {
    if (loaded) {
      initializeCastApi();
    } else {
      console.error('Chromecast API error', errorInfo);
    }
  };

  // Check if the Chromecast is initialised
  // (might happend if one day Arte implement the Chromecast)
  if (!chrome.cast || !chrome.cast.isAvailable) {
    setTimeout(initializeCastApi, 1000);
  }

  // Init the Cast API
  function initializeCastApi() {
    console.info('Initialize Chromecast API');
    var sessionRequest = new chrome.cast.SessionRequest(
      chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID
    );
    var apiConfig = new chrome.cast.ApiConfig(
      sessionRequest,
      sessionListener,
      receiverListener
    );
    chrome.cast.initialize(apiConfig, onInitSuccess, onError);
  }

  function sessionListener(e) {
    console.log('SessionListener', e);
  }

  function receiverListener(e) {
    if (e === chrome.cast.ReceiverAvailability.AVAILABLE) {
      // Perfect time to show the chromecast button
      console.info('Chromecast available');
      var btns = document.querySelectorAll('.cc_bttn_wrap');
      for (i = 0; i < btns.length; i++) {
        btns[i].style.display = 'inline-block';
      }
    } else {
      console.error('Chromecast not available');
    }
  }

  function onInitSuccess() {
    console.info('Succesfully init');
  }

  function onError(e) {
    console.error('Init failed', e);
  }
}

/**
 * Start to cast the video URL given as parameter.
 * The media must be a MP4 video.
 * This is the only one method available from
 * the global namespace.
 *
 * @param  {string} currentMediaURL Video URL
 */
window.chromecaster = window.chromecaster = function (
  currentMediaURL,
  title,
  subtitle,
  duration
) {
  if (window.chromecasterSession) {
    onRequestSessionSuccess(window.chromecasterSession);
  } else {
    // Request a session to cast
    chrome.cast.requestSession(onRequestSessionSuccess, onLaunchError);
  }

  function onLaunchError(e) {
    console.error('Fail to request a session', e);
  }

  function onRequestSessionSuccess(session) {
    window.chromecasterSession = session;

    var mediaInfo = new chrome.cast.media.MediaInfo(currentMediaURL);
    mediaInfo.contentType = 'video/mp4';
    mediaInfo.metadata = {
      title: title || 'Arte +7',
      subtitle: subtitle || 'Chromecast pour Arte +7',
    };
    mediaInfo.customData = null;
    mediaInfo.streamType = chrome.cast.media.StreamType.BUFFERED;
    mediaInfo.textTrackStyle = new chrome.cast.media.TextTrackStyle();
    mediaInfo.duration = (duration && parseInt(duration, 10)) || null;

    var request = new chrome.cast.media.LoadRequest(mediaInfo);
    session.loadMedia(
      request,
      onMediaDiscovered.bind(this, 'loadMedia'),
      onMediaError
    );

    function onMediaDiscovered(how, media) {
      console.info('Media discovered', how, media);
      currentMedia = media;
      currentMedia.play(
        null,
        function (e) {
          console.info('Media play success');
        },
        function (e) {
          console.error('Media play failed');
        }
      );
    }

    function onMediaError(e) {
      console.error('Media failed', e);
    }
  }
};
