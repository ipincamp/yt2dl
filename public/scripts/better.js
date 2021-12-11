const startBtn = document.querySelector('.start-btn');
const videoURL = document.querySelector('.video-url');
const videoTmbImg = document.querySelector('.video-tmb');
const videoTtl = document.querySelector('.video-ttl');
// Const resolutionsDiv = document.querySelector('.resolutions');
const downBtn = document.querySelector('.down-btn');

const getVideoId = () => {
  const url = videoURL.value;
  const searchParams = new URLSearchParams(url.split('?')[1]);
  return searchParams.get('v');
};

const getVideoInfo = async id => {
  const res = await fetch(`/api/video?id=${id}`);
  return res.json();
};

// Soon
// const showResolutions = resolutions => {
//   const html = resolutions
//     .map((resolution, i) => `
//       <label>
//         <input type="radio" name="resolutions" value="${resolution}" ${i === 0 ? 'checked' : ''}>
//         ${resolution}
//       </label>
//     `)
//     .join('');
//   resolutionsDiv.innerHTML = html;
// };
//
// const getRadioValue = name => document.querySelector(`input[name="${name}"]:checked`).value;

const getDownAnchor = ({ id, resolution, format }) => {
  let url = `/download?id=${id}&format=${format}`;

  if (format === 'video') {
    url += `&resolution=${resolution}`;
  }

  const a = document.createElement('a');
  a.href = url;
  a.download = true;

  return a;
};

const download = ({ id, resolution, format }) => {
  const a = getDownAnchor({ id, resolution, format });
  a.click();
};

startBtn.addEventListener(
  'click',
  async() => {
    const id = getVideoId();

    // eslint-disable-next-line no-unused-vars
    const { title, resolutions, thumbnailURL } = await getVideoInfo(id);

    videoTtl.textContent = title;
    videoTmbImg.src = thumbnailURL;

    // RshowResolutions(resolutions);
  },
);

downBtn.addEventListener(
  'click',
  () => {
    download({
      id: getVideoId(),
      // Resolution: getRadioValue('resolution'),
      // format: getRadioValue('format'),
      format: 'audio',
    });
  },
);
