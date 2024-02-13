const startBtn = document.querySelector('.start-btn');
const sectionSecond = document.querySelector('section.second');
const sectionThird = document.querySelector('section.third');
const sectionFourth = document.querySelector('section.fourth');
const videoURL = document.querySelector('.video-url');
const videoTmbImg = document.querySelector('.video-tmb');
const videoTtl = document.querySelector('.video-ttl');
const resolutionsDiv = document.querySelector('.resolutions');
const downBtn = document.querySelector('.down-btn');

// Filter url to get ID only
const getVideoId = () => {
  const url = videoURL.value;
  if (url.includes('youtu.be')) {
    return url.slice(-11);
  }
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
      <input type="radio" name="resolution" id="${resolution}" value="${resolution}" ${i === 0 ? 'checked' : ''}>
      <label for="${resolution}">${resolution}</label>
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
    [sectionSecond, sectionThird, sectionFourth].forEach(e => e.style.display = 'block');
    downBtn.style.display = 'inline-block';

    videoTtl.textContent = title;
    videoTmbImg.src = thumbnailURL;

    showResolutions(resolutions);
  },
);

sectionThird.addEventListener('click', e => {
  // eslint-disable-next-line eqeqeq
  if (e.target.defaultValue == 'video') {
    sectionFourth.style.display = 'block';
  // eslint-disable-next-line eqeqeq
  } else if (e.target.defaultValue == 'audio') {
    sectionFourth.style.display = 'none';
  }
});

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
