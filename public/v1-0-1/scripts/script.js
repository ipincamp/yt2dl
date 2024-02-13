/**
 * @name yt2mp3
 * @version v1.0.1
 * @author ipincamp <support@nur-arifin.my.id>
 * @license GNU (General Public License v3.0)
 */

const cvButton = document.querySelector('.cvb');
const inputURL = document.querySelector('.url');
const thumbURL = document.querySelector('.tmb');
const videoTtl = document.querySelector('.ttl');
const videoOwn = document.querySelector('.own');
const downBttn = document.querySelector('.dwn');
const errorURL = document.querySelector('.eru');
const SectInfo = document.querySelector('section.info');
const SectDown = document.querySelector('section.download');

const getID = () => {
  const url = inputURL.value;

  return url;
};

const getVideoID = () => {
  const url = inputURL.value;

  if (url.includes('youtu.be')) {
    return url.slice(-11);
  }
  const searchParams = new URLSearchParams(url.split('?')[1]);

  return searchParams.get('v');
};

const getVideoInfo = async (id) => {
  const res = await fetch(`/api?id=${id}`);

  return res.json();
};

const show = (...args) => args.forEach((x) => x.classList.remove('d-none'));

const getFormats = (name) => document.querySelector(`[name="${name}"]:checked`).value;

const getDownloadAnchor = ({ id, format }) => {
  let url = `/convert?id=${id}&format=${format}`;

  const a = document.createElement('a');
  a.href = url;
  a.download = true;

  return a;
};

const download = ({ id, format }) => {
  const a = getDownloadAnchor({ id, format });
  a.click();
};

cvButton.addEventListener('click', async () => {
  try {
    const id = getID();

    if (id === null) {
      errorURL.innerHTML = 'Please enter a valid link!';
      errorURL.style.cssText += 'padding-bottom: 20px';
      return;
    }

    setTimeout(() => {
      document.getElementById('eru').hidden = true;
    }, 3000);

    const {
      title,
      owner,
      uploadDate,
      thumbnail,
    } = await getVideoInfo(id);

    videoTtl.textContent = title;
    videoOwn.textContent = `${owner} - ${uploadDate}`;
    thumbURL.src = thumbnail;

    show(SectInfo, SectDown);
  } catch {
    const id = getVideoID();

    if (id === null) {
      errorURL.innerHTML = 'Please enter a valid link!';
      errorURL.style.cssText += 'padding-bottom: 20px';
      return;
    }

    setTimeout(() => {
      document.getElementById('eru').hidden = true;
    }, 3000);

    const {
      title,
      owner,
      uploadDate,
      thumbnail,
    } = await getVideoInfo(id);

    videoTtl.textContent = title;
    videoOwn.textContent = `${owner} - ${uploadDate}`;
    thumbURL.src = thumbnail;

    show(SectInfo, SectDown);
  }
});

downBttn.addEventListener(
  'click',
  () => {
    try {
      try {
        download({
          id: getID(),
          format: getFormats('format'),
        });
      } catch (err) {
        console.error(err);
      }
    } catch {
      try {
        download({
          id: getVideoID(),
          format: getFormats('format'),
        });
      } catch (err) {
        console.error(err);
      }
    }
  },
);
