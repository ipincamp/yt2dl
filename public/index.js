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

const getDataApi = async (url) => {
  const res = await fetch(`/api?url=${url}`);
  return res.json();
};

const getInputUrl = () => {
  const url = `${inputUrl.value}`;
  if (url.length === 11 || url.includes('youtu.be') || url.includes('youtube.com')) {
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
    url, type, bitrate, resolution,
  });
  link.click();
};

const getRadioValue = (i) => document.querySelector(`[name="${i}"]:checked`).value;

const showFormats = () => {
  const list = `
    <label>
      <input type="radio" name="type" value="aud" checked>
      Audio
    </label>
    <label>
      <input type="radio" name="type" value="vid">
      Video
    </label>
  `;
  formatTypes.innerHTML = `
    <h2>Formats</h2>
    ${list}
  `;
};

const showAudioBitrates = (bitrates) => {
  const list = bitrates
    .map((bitrate, i) => `
      <label>
        <input type="radio" name="bitrate" value="${bitrate}" ${i === 0 ? 'checked' : ''}>
        ${bitrate}
      </label>
    `)
    .join('');
  audioBitrates.innerHTML = `
    <h2>Bitrates</h2>
    ${list}
  `;
};

const showResolutions = (resolutions) => {
  const list = resolutions
    .map((resolution, i) => `
      <label>
        <input type="radio" name="resolution" value="${resolution}" ${i === 0 ? 'checked' : ''}>
        ${resolution}
      </label>
    `)
    .join('');
  videoResolutions.innerHTML = `
    <h2>Resolutions</h2>
    ${list}
  `;
};

searchButton.addEventListener('click', async () => {
  const url = getInputUrl();
  const {
    title, thumbnail, durations, channel, resolutions, bitrate,
  } = await getDataApi(url);
  videoThumbnail.src = thumbnail;
  videoTitle.textContent = title;
  videoInfo.textContent = `${durations} - ${channel}`;
  showFormats();
  showResolutions(resolutions);
  showAudioBitrates(bitrate);
  downloadButton.classList.remove('d-none');
});

downloadButton.addEventListener('click', () => {
  getDownloadLink({
    url: getInputUrl(),
    type: getRadioValue('type'),
    bitrate: getRadioValue('bitrate'),
    resolution: getRadioValue('resolution'),
  });
});
