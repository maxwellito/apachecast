function setDomain(url) {
  url = url || window.prompt('Provide the base URL of your Apache server');

  if (!url) {
    return;
  }
  if (!url.startsWith('http')) {
    return alert('Please enter a valid URL. It must start by "http(s)://"');
  }
  if (/\/\/(localhost|127\.0\.0\.1)/.test(url)) {
    return alert("You're on localhost babe, it won't work. xx");
  }
  return fetch(url)
    .then((x) => x.text())
    .then(
      () => {
        goToDir(url);
      },
      (e) => {
        console.error(e);
        window.alert(
          "Cannot read from your server. Make sure it's CORS enabled."
        );
      }
    );
}

function setDir(url) {
  window.location.hash = url;
}

function goToDir(url) {
  loadDir(url).then(
    (fileList) => {
      topbar.setDomain(url);
      directory.setFiles(fileList);
    },
    (e) => {
      console.error(e);
      alert('An error has occured. Please check the logs');
    }
  );
}

function goCast(mediaUrl) {
  if (window.event && window.event.currentTarget) {
    window.event.currentTarget.classList.add('played');
  }
  localStorage.setItem(`tap_${mediaUrl}`, 1);
  window.open(
    `https://maxwellito.github.io/apachecast/cast.html#${mediaUrl}`,
    '_blank'
  );
}

// Set up template
const topbar = new TopbarCtrl();
const directory = new DirectoryCtrl();
document.body.appendChild(topbar.el);
document.body.appendChild(directory.el);

// Set up domain if provided
function hashHandler() {
  if (location.hash) {
    setDomain(location.hash.substr(1));
  } else {
    const domain = location.toString().split('/').slice(0, 3).join('/');
    setDomain(domain);
  }
}
window.addEventListener('hashchange', hashHandler, false);
hashHandler();
