/**
 * @name yt2mp3
 * @version v1.0.4
 * @author ipincamp <support@nur-arifin.my.id>
 * @license GNU (General Public License v3.0)
 */

const searchBT = document.querySelector('.cvb');
const inputURL = document.querySelector('.url');
const thumbURL = document.querySelector('.tmb');
const videoTtl = document.querySelector('.ttl');
const videoOwn = document.querySelector('.own');
const downBTTN = document.querySelector('.dwn');
const errorURL = document.querySelector('.eru');
const SectInfo = document.querySelector('section.info');
const SectFrmt = document.querySelector('section.format-container');
const SectDown = document.querySelector('section.download');
const CprgYear = document.querySelector('.year');

CprgYear.innerHTML = new Date().getFullYear();

const getVideoID = () => {
  const url = inputURL.value;
  let id;

  if (url.includes('youtu.be')) {
    id = url.slice(-11);
  } else if (url.includes('shorts')) {
    id = new URLSearchParams(url.split('?')[0]);
  } else if (url.length === 11 || url.length === 34 || url.includes('?list=')) {
    id = url;
  } else if (url.includes('youtube.com')) {
    id = new URLSearchParams(url.split('?')[1]).get('v');
  }

  return id;
};

const getVideoInfo = async (id) => {
  const res = await fetch(`/api?id=${id}`);
  return res.json();
};

const getFormat = (name) => document.querySelector(`[name="${name}"]:checked`).value;

const getDownloadAV = ({ id, format }) => {
  let url = `/convert?id=${id}&format=${format}`;

  const a = document.createElement('a');
  a.href = url;
  a.download = true;
  return a;
};

const download = ({ id, format }) => {
  const a = getDownloadAV({ id, format });
  a.click();
};

const show = (...args) => args.forEach((x) => x.classList.remove('d-none'));

const notfEru = () => {
  show(errorURL);

  setTimeout(() => {
    window.location.reload();
  }, 1500);
};

searchBT.addEventListener('click', async () => {
  const id = getVideoID();
  if (!id) {
    notfEru();
    return;
  }

  let videoInfo;
  try {
    videoInfo = await getVideoInfo(id);
  } finally {
    if (!videoInfo) {
      notfEru();
      return;
    }
  }

  const {
    VorPTitle,
    owner,
    thumbnail,
    videoUploadDate,
    plVideoLength,
  } = videoInfo;

  videoTtl.textContent = VorPTitle;
  videoOwn.textContent = `${owner} - ${videoUploadDate || plVideoLength}`;
  thumbURL.src = thumbnail;

  {
    const listSectionToShow = [SectInfo, SectFrmt];
    if (plVideoLength) {
      listSectionToShow.pop();
    }
    show(...listSectionToShow);
  }
});

SectFrmt.addEventListener('click', () => show(SectDown));

downBTTN.addEventListener('click', () => {
  try {
    download({
      id: getVideoID(),
      format: getFormat('format'),
    });
  } catch (err) {
    return console.error(err);
  }
});
