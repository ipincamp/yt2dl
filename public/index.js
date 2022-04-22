/**
 * @name yt2dl
 * @version v1.0.5
 * @author ipincamp <support@nur-arifin.my.id>
 * @license GNU (General Public License v3.0)
 */

const audioBitrates = document.querySelector('.audio-bitrate');
const downloadButton = document.querySelector('.download-button');
const formatTypes = document.querySelector('.format-type');
const inputUrl = document.querySelector('.input-url');
const searchButton = document.querySelector('.search-button');
const videoInfo = document.querySelector('.video-info');
const videoResolutions = document.querySelector('.video-resolutions');
const videoThumbnail = document.querySelector('.video-thumbnail');
const videoTitle = document.querySelector('.video-title');
const infoSection = document.querySelector('section.info');
const formatSection = document.querySelector('section.format-container');
const downloadSection = document.querySelector('section.download');
const errorMessage = document.querySelector('.error-url');
const copyrightYear = document.querySelector('.copyright-year');

copyrightYear.innerHTML = new Date().getFullYear();

const getDataApi = async (url) => {
  const res = await fetch(`/api?url=${url}`);
  return res.json();
};

const getInputUrl = () => {
  const url = `${inputUrl.value}`;
  if (
    url.length === 11
    || url.includes('youtu.be')
    || url.includes('youtube.com')
  ) {
    return url;
  }
};

const getDownloadAnchor = ({
  url, type, bitrate, resolution,
}) => {
  let link = `/get?url=${url}&typ=${type}&bit=${bitrate}`;
  if (type === 'vid') {
    link += `&qty=${resolution}`;
  }
  const rel = document.createElement('a');
  rel.href = link;
  return rel;
};

const getDownloadLink = ({
  url, type, bitrate, resolution,
}) => {
  const link = getDownloadAnchor({
    url,
    type,
    bitrate,
    resolution,
  });
  link.click();
};

const show = (...a) => a.forEach((b) => b.classList.remove('d-none'));

const getRadioValue = (i) => document.querySelector(`[name="${i}"]:checked`).value;

const showFormats = () => {
  const list = `
    <label>
      <input class="faud" type="radio" name="type" value="aud" checked>
      <div class="custom-radio-btn">Audio</div>
    </label>
    <label>
      <input class="fvid" type="radio" name="type" value="vid">
      <div class="custom-radio-btn">Video</div>
    </label>
  `;
  formatTypes.innerHTML = list;
  const ao = document.querySelector('.faud');
  const vo = document.querySelector('.fvid');
  ao.addEventListener('click', () => {
    videoResolutions.classList.add('d-none');
    show(audioBitrates);
  });
  vo.addEventListener('click', () => show(audioBitrates, videoResolutions));
};

const showAudioBitrates = (bitrates) => {
  const list = bitrates
    .map(
      (bitrate, i) => `
      <label>
        <input type="radio" name="bitrate" value="${bitrate}" ${i === 0 ? 'checked' : ''}>
        <div class="custom-radio-btn audiobitrate">${bitrate}</div>
      </label>
    `,
    )
    .join('');
  audioBitrates.innerHTML = list;
};

const showResolutions = (resolutions) => {
  const list = resolutions
    .map(
      (resolution, i) => `
      <label>
        <input type="radio" name="resolution" value="${resolution}" ${i === 0 ? 'checked' : ''}>
        <div class="custom-radio-btn">${resolution}</div>
      </label>
    `,
    )
    .join('');
  videoResolutions.innerHTML = list;
};

searchButton.addEventListener('click', async () => {
  const url = getInputUrl();
  const {
    status,
    error,
    title,
    thumbnail,
    durations,
    channel,
    resolutions,
    bitrate,
  } = await getDataApi(url);
  if (status === false) {
    errorMessage.textContent = error;
    setTimeout(() => {
      errorMessage.textContent = '';
    }, 5000);
  } else {
    videoThumbnail.src = thumbnail;
    videoTitle.textContent = title;
    videoInfo.textContent = `${durations} - ${channel}`;
    showFormats();
    showResolutions(resolutions);
    showAudioBitrates(bitrate);
    show(infoSection, formatSection, downloadSection);
  }
});

downloadButton.addEventListener('click', () => {
  getDownloadLink({
    url: getInputUrl(),
    type: getRadioValue('type'),
    bitrate: getRadioValue('bitrate'),
    resolution: getRadioValue('resolution'),
  });
});
