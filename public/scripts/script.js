/**
 * @name yt2mp3
 * @version v1.0.2
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

    if ((id === null) || (id === undefined)) {
      errorURL.innerHTML = 'Please enter a valid link!';
      errorURL.style.cssText += 'padding-bottom: 20px';

      setTimeout(() => {
        document.getElementById('eru').hidden = true;
        window.location.reload();
      }, 3000);

      return;
    }

    const {
      title, owner, uploadDate, thumbnail,
    } = await getVideoInfo(id);

    if (uploadDate === undefined) {
      const { videos } = await getVideoInfo(id);

      videoTtl.textContent = title;
      videoOwn.textContent = owner;
      let videoList = document.getElementById('lis');

      videos.forEach((item) => {
        let li = document.createElement('ul');
        const content = `${item[0]}. ${item[1]} - <mark>${item[2]}</mark>`;

        li.innerHTML += content;
        videoList.appendChild(li);
      });

      show(SectInfo);
    } else {
      videoOwn.textContent = `${owner} - ${uploadDate}`;

      show(SectInfo, SectDown);
    }
    videoTtl.textContent = title;
    thumbURL.src = thumbnail;
  } catch {
    const id = getVideoID();

    if ((id === null) || (id === undefined)) {
      errorURL.innerHTML = 'Please enter a valid link!';
      errorURL.style.cssText += 'padding-bottom: 20px';

      setTimeout(() => {
        document.getElementById('eru').hidden = true;
        window.location.reload();
      }, 3000);

      return;
    }

    const {
      title, owner, uploadDate, thumbnail,
    } = await getVideoInfo(id);

    if (uploadDate === undefined) {
      const { videos } = await getVideoInfo(id);

      videoTtl.textContent = title;
      videoOwn.textContent = owner;
      let videoList = document.getElementById('lis');

      videos.forEach((item) => {
        let li = document.createElement('ul');
        const content = `${item[0]}. ${item[1]} - <mark>${item[2]}</mark>`;

        li.innerHTML += content;
        videoList.appendChild(li);
      });

      show(SectInfo);
    } else {
      videoOwn.textContent = `${owner} - ${uploadDate}`;

      show(SectInfo, SectDown);
    }
    videoTtl.textContent = title;
    thumbURL.src = thumbnail;
  }
});

downBttn.addEventListener('click', () => {
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
});
