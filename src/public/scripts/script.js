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
const SectFrmt = document.querySelector('section.format');
const SectDown = document.querySelector('section.download');

const getID = () => {
  const url = inputURL.value;
  return url;
};

const getVideoID = () => {
  const url = inputURL.value;

  try {
    if (url.includes('youtu.be')) {
      return url.slice(-11);
    }
    if (url.includes('shorts')) {
      return new URLSearchParams(url.split('?')[0]);
    }
  } catch {
    const searchParams = new URLSearchParams(url.split('?')[1]);
    return searchParams.get('v');
  }
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

searchBT.addEventListener('click', async () => {
  try {
    const id = getID();

    if ((id === null) || (id === undefined)) {
      errorURL.innerHTML = 'Please enter a valid link!';
      errorURL.style.cssText += 'padding-bottom: 20px';

      setTimeout(() => {
        document.getElementById('eru').hidden = true;
        window.location.reload();
      }, 1500);

      return;
    }

    const {
      videoTitle,
      videoOwner,
      videoUploadDate,
      videoThumbnail,
    } = await getVideoInfo(id);

    if (videoUploadDate === undefined) {
      const {
        plTitle,
        plOwner,
        plVideoLength,
        plThumbnail,
      } = await getVideoInfo(id);

      videoTtl.textContent = plTitle;
      videoOwn.textContent = `${plOwner} - ${plVideoLength} video found`;
      thumbURL.src = plThumbnail;

      show(SectInfo);
    } else {
      videoOwn.textContent = `${videoOwner} - ${videoUploadDate}`;
      videoTtl.textContent = videoTitle;
      thumbURL.src = videoThumbnail;

      show(SectInfo, SectFrmt);
    }
  } catch {
    const id = getVideoID();

    if ((id === null) || (id === undefined)) {
      errorURL.innerHTML = 'Please enter a valid link!';
      errorURL.style.cssText += 'padding-bottom: 20px';

      setTimeout(() => {
        document.getElementById('eru').hidden = true;
        window.location.reload();
      }, 1500);

      return;
    }

    const {
      videoTitle,
      videoOwner,
      videoUploadDate,
      videoThumbnail,
    } = await getVideoInfo(id);

    if (videoUploadDate === undefined) {
      const {
        plTitle,
        plOwner,
        plVideoLength,
        plThumbnail,
      } = await getVideoInfo(id);

      videoTtl.textContent = plTitle;
      videoOwn.textContent = `${plOwner} - ${plVideoLength} video found`;
      thumbURL.src = plThumbnail;

      show(SectInfo);
    } else {
      videoOwn.textContent = `${videoOwner} - ${videoUploadDate}`;
      videoTtl.textContent = videoTitle;
      thumbURL.src = videoThumbnail;

      show(SectInfo, SectFrmt);
    }
  }
});

SectFrmt.addEventListener('click', () => show(SectDown));

downBTTN.addEventListener('click', () => {
  try {
    try {
      download({
        id: getID(),
        format: getFormat('format'),
      });
    } catch {
      download({
        id: getVideoID(),
        format: getFormat('format'),
      });
    }
  } catch (err) {
    return console.error(err);
  }
});
