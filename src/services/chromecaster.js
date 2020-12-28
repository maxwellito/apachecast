// Send a URL to stream to the TV
let chromecaster = (currentMediaURL) => {
  var castSession = cast.framework.CastContext.getInstance().getCurrentSession();
  var mediaInfo = new chrome.cast.media.MediaInfo(currentMediaURL, 'video/mp4');
  var request = new chrome.cast.media.LoadRequest(mediaInfo);
  castSession.loadMedia(request);
};
