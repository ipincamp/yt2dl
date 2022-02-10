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

const getFormats = (name) => document.getElementById(name).value;

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
  const id = getVideoID();
  const { title, owner, thumbnail } = await getVideoInfo(id);

  videoTtl.textContent = title;
  videoOwn.textContent = `By ${owner}`;
  thumbURL.src = thumbnail;

  document.querySelector('.item-container section:nth-child(2)').style.display = 'block';
  document.querySelector('.item-container section:nth-child(3)').style.display = 'flex';
});

downBttn.addEventListener('click', () => {
  download({
    id: getVideoID(),
    format: getFormats('format'),
  });
});

function closeAllSelect(elmnt) {
  const x = document.getElementsByClassName('select-items');
  const y = document.getElementsByClassName('select-selected');
  const xl = x.length;
  const yl = y.length;
  const arrNo = [];

  for (let i = 0; i < yl; i++) {
    if (elmnt === y[i]) {
      arrNo.push(i);
    } else {
      y[i].classList.remove('select-arrow-active');
    }
  }
  for (let i = 0; i < xl; i++) {
    if (arrNo.indexOf(i)) {
      x[i].classList.add('select-hide');
    }
  }
  document.querySelector('.select-selected').style.borderRadius = '10px';
}

function selectFormat() {
  const x = document.querySelector('.format');
  const selElmnt = x.querySelector('select');
  const ll = selElmnt.length;

  const a = document.createElement('DIV');
  a.setAttribute('class', 'select-selected');
  a.innerHTML = selElmnt.options[selElmnt.selectedIndex].innerHTML;

  const b = document.createElement('DIV');
  x.appendChild(a);
  b.setAttribute('class', 'select-items select-hide');

  for (let j = 1; j < ll; j++) {
    const c = document.createElement('DIV');
    c.innerHTML = selElmnt.options[j].innerHTML;
    c.addEventListener('click', function () {
      const s = this.parentNode.parentNode.querySelector('select');
      const sl = s.length;
      const h = this.parentNode.previousSibling;

      for (let i = 0; i < sl; i++) {
        if (s.options[i].innerHTML === this.innerHTML) {
          const y = this.parentNode.getElementsByClassName('same-as-selected');
          const yl = y.length;

          s.selectedIndex = i;
          h.innerHTML = this.innerHTML;
          for (let k = 0; k < yl; k++) {
            y[k].removeAttribute('class');
          }
          this.setAttribute('class', 'same-as-selected');
          break;
        }
      }
      h.click();
    });
    b.appendChild(c);
  }
  x.appendChild(b);
  a.addEventListener('click', function (e) {
    e.stopPropagation();
    closeAllSelect(this);
    this.nextSibling.classList.toggle('select-hide');
    this.classList.toggle('select-arrow-active');
    if (getComputedStyle(this).borderRadius === '10px') {
      this.style.borderRadius = '10px 10px 0 0';
    } else {
      this.style.borderRadius = '10px';
    }
  });
}

selectFormat();
document.addEventListener('click', closeAllSelect);
