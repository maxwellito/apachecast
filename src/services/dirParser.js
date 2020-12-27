const EOL = /\?|#/;
const RelativeRegex = /^(http\:|https\:|ftp\:|\/\/)/;
const authorizedMediaTypes = ['mp3', 'mp4', 'mkv', 'm4v', 'webm'];

function loadDir(path) {
  return fetch(path)
    .then((x) => x.text())
    .then((html) => parseDirHtml(html, path));
}

function parseDirHtml(html, basePath) {
  const domain = basePath.split('/').slice(0, 3).join('/');
  const wrap = document.createElement('div');
  wrap.innerHTML = html;
  return Array.from(wrap.querySelectorAll('a'))
    .map((a) => {
      let link = a.getAttribute('href').split(EOL)[0];
      if (link.startsWith('/')) {
        link = domain + link;
      } else if (!RelativeRegex.test(link)) {
        link = basePath + link;
      }
      const isDir = link.endsWith('/');
      const label = a.innerText;
      return { link, label, isDir };
    })
    .filter((file) => {
      const mediaType = file.link.split('.').pop();
      const isApprovedType = authorizedMediaTypes.includes(mediaType);
      const isCurrentLocation = file.link === basePath;
      const isSameDomain = file.link.startsWith(domain);
      return (
        (file.isDir || isApprovedType) && !isCurrentLocation && isSameDomain
      );
    });
}
