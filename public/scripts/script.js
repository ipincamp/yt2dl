const startBtn = document.querySelector('.start-btn');
const sectionSecond = document.querySelector('section.second');
const sectionThird = document.querySelector('section.third');
const videoURL = document.querySelector('.video-url');
const videoTmbImg = document.querySelector('.video-tmb');
const videoTtl = document.querySelector('.video-ttl');
const resolutionsDiv = document.querySelector('.resolutions');
const downBtn = document.querySelector('.down-btn');

// Filter url to get ID only
const getVideoId = () => {
  const url = videoURL.value;
  const searchParams = new URLSearchParams(url.split('?')[1]);
  return searchParams.get('v');
};

// eslint-disable-next-line space-before-function-paren
// eslint-disable-next-line arrow-parens
const getVideoInfo = async(id) => {
  const res = await fetch(`/api/video?id=${id}`);
  return res.json();
};

const showResolutions = resolutions => {
  const html = resolutions
    .map((resolution, i) => `
      <label>
        <input type="radio" name="resolution" value="${resolution}" ${i === 0 ? 'checked' : ''}>
        ${resolution}
      </label>
    `)
    .join('');
  resolutionsDiv.innerHTML = html;
};

const getRadioValue = name =>
  // eslint-disable-next-line implicit-arrow-linebreak
  document.querySelector(`[name="${name}"]:checked`).value;

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

    const { title, resolutions, thumbnailURL } = await getVideoInfo(id);

    // DOM CSS
    [sectionSecond, sectionThird].forEach(e => e.style.display = 'block');
    downBtn.style.display = 'inline-block';

    videoTtl.textContent = title;
    videoTmbImg.src = thumbnailURL;

    showResolutions(resolutions);
  },
);

downBtn.addEventListener(
  'click',
  () => {
    download({
      id: getVideoId(),
      resolution: getRadioValue('resolution'),
      format: getRadioValue('format'),
    });
  },
);
