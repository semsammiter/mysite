const fallbackImage = 'icon/notfound.jpg';

// Галерея элементы
const img = document.getElementById('photo');
const gallery = document.getElementById('gallery');
const bg = document.getElementById('galleryBg');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const infoBtn = document.getElementById('infoBtn');
const playBtn = document.getElementById('playBtn');
const fsBtn = document.getElementById('fsBtn');
const descPopup = document.getElementById('descPopup');
const descText = document.getElementById('descText');
const fsOverlay = document.getElementById('fullscreenOverlay');
const fsImage = document.getElementById('fsImage');
const fsClose = document.getElementById('fsClose');
const closeDesc = document.getElementById('closeDesc');

// Разделы и управление
const btnHome = document.getElementById('btnHome');
const btnVideo = document.getElementById('btnVideo');
const btnGallery = document.getElementById('btnGallery');
const btnShare = document.getElementById('btnShare');
const btnQR = document.getElementById('btnQR');
const homeSection = document.getElementById('homeSection');
const videoSection = document.getElementById('videoSection');
const gallerySection = document.getElementById('gallerySection');
const video = document.getElementById('introVideo');

// Модалки Поделиться и QR
const shareModal = document.getElementById('shareModal');
const shareNative = document.getElementById('shareNative');
const shareCopy = document.getElementById('shareCopy');
const closeShare = document.getElementById('closeShare');
const shareMsg = document.getElementById('shareMsg');

const qrModal = document.getElementById('qrModal');
const closeQR = document.getElementById('closeQR');
const qrImage = document.getElementById('qrImage');

// Состояния
let current = 0;
let startX = 0;
let isSwiping = false;
let autoSlide = null;
let inFullscreen = false;

// --- Галерея: показ фото ---
function updateButtons() {
  prevBtn.style.display = current > 0 ? 'block' : 'none';
  nextBtn.style.display = current < photos.length - 1 ? 'block' : 'none';
}

function showPhoto(index) {
  if (!photos || photos.length === 0) {
    img.src = fallbackImage;
    img.alt = 'Нет фото';
    return;
  }

  current = (index + photos.length) % photos.length;
  const photo = photos[current];

  // затемнение фона и плавное появление
  gallery.classList.add('fade-bg');
  img.classList.add('fade-out');

  setTimeout(() => {
    img.src = photo.src;
    img.alt = photo.alt || '';
    img.classList.remove('fade-out');
    gallery.classList.remove('fade-bg');
    updateButtons();
    infoBtn.style.display = (photo.desc && photo.desc.trim() !== '') ? 'block' : 'none';
  }, 300);
}

img.onerror = () => {
  const src = img.src;
  if (src.endsWith('.jpg')) {
    img.src = src.replace('.jpg', '.JPG');
  } else if (src.endsWith('.JPG')) {
    img.src = src.replace('.JPG', '.jpg');
  } else {
    img.src = fallbackImage;
    img.alt = 'Изображение не найдено';
  }
};


// Навигация
prevBtn.onclick = () => showPhoto(current - 1);
nextBtn.onclick = () => showPhoto(current + 1);

// свайп с анимацией
gallery.addEventListener('touchstart', e => {
  if (e.touches.length === 1) {
    startX = e.touches[0].clientX;
    isSwiping = true;
    img.style.transition = 'none';
  }
});
gallery.addEventListener('touchmove', e => {
  if (!isSwiping) return;
  const dx = e.touches[0].clientX - startX;
  img.style.transform = `translateX(${dx}px)`;
});
gallery.addEventListener('touchend', e => {
  if (!isSwiping) return;
  isSwiping = false;
  const dx = e.changedTouches[0].clientX - startX;
  img.style.transition = 'transform 0.3s ease';
  img.style.transform = 'translateX(0)';
  if (Math.abs(dx) > 60) (dx > 0) ? showPhoto(current - 1) : showPhoto(current + 1);
});

// ---------- INFO button (popup) - надёжно через класс hidden ----------
infoBtn.addEventListener('click', () => {
  const photo = (typeof photos !== 'undefined' && photos.length) ? photos[current] : null;
  if (!photo || !photo.desc || !photo.desc.trim()) return; // если описания нет — ничего не делаем

  // показываем popup (через класс)
  descText.textContent = photo.desc;
  descPopup.classList.remove('hidden');

  // автозакрытие через 3 секунды
  clearTimeout(descPopup._timer);
  descPopup._timer = setTimeout(() => {
    descPopup.classList.add('hidden');
  }, 3000);
});

// крестик закрытия
closeDesc.addEventListener('click', () => {
  clearTimeout(descPopup._timer);
  descPopup.classList.add('hidden');
});


// slideshow
playBtn.onclick = () => {
  if (autoSlide) {
    clearInterval(autoSlide);
    autoSlide = null;
    playBtn.textContent = '▶'; // HTML-символ для воспроизведения
  } else {
    autoSlide = setInterval(() => showPhoto(current + 1), 3000);
    playBtn.textContent = '❚❚'; // Простой символ паузы (можно использовать '&#9646;&#9646;' или '&#x23F8;')
  }
};

// fullscreen open/close with history handling
function openFullscreen() {
  if (!img.src) return;
  fsImage.src = img.src;
  
  // Управление видимостью только через класс 'hidden'
  fsOverlay.classList.remove('hidden'); 
  fsOverlay.style.display = 'flex'; // УДАЛЕНО

  // добавим класс анимации
  fsImage.classList.remove('fs-enter'); 
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      fsImage.classList.add('fs-enter');
    });
  });

  inFullscreen = true;
  history.pushState({ modal: 'fullscreen' }, '', '');
}

function closeFullscreen(triggeredByPop = false) {
  fsImage.classList.remove('fs-enter');
  fsOverlay.classList.add('hidden');
  // fsOverlay.style.display = 'none'; // УДАЛЕНО
  inFullscreen = false;
  
 
}

// !!! ИСПРАВЛЕНИЕ: Останавливаем всплытие клика на изображении
fsImage.addEventListener('click', e => {
    e.stopPropagation(); 
});

// Закрытие по клику на фон
fsOverlay.addEventListener('click', e => {
  if (e.target === fsOverlay) closeFullscreen(false);
});

// Закрытие по Esc (если открыт fullscreen)
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && inFullscreen) {
    closeFullscreen(false);
  }
});

fsBtn.onclick = openFullscreen;
fsClose.onclick = () => closeFullscreen(false);
// Удален дублирующийся обработчик fsOverlay.addEventListener('click', ...

// --- Разделы ---
function showSection(section) {
  // Обновляем ARIA-атрибуты для доступности
  [homeSection, videoSection, gallerySection].forEach(el => {
      el.classList.add('hidden');
      el.setAttribute('aria-hidden', 'true');
  });
  section.classList.remove('hidden');
  section.setAttribute('aria-hidden', 'false');

  [btnHome, btnVideo, btnGallery, btnShare, btnQR].forEach(btn => btn.classList.remove('active'));
}
btnHome.onclick = () => {
  showSection(homeSection);
  btnHome.classList.add('active');
  video.pause();
};
btnVideo.onclick = () => {
  showSection(videoSection);
  btnVideo.classList.add('active');
  video.play();
};
btnGallery.onclick = () => {
  showSection(gallerySection);
  btnGallery.classList.add('active');
  showPhoto(current); // Показываем текущее фото, а не всегда 0
};

// --- Поделиться (modal) ---
function openShare() {
  closeQRModal(false);
  shareMsg.textContent = '';
  shareModal.classList.remove('hidden');
  shareModal.setAttribute('aria-hidden', 'false');
  history.pushState({ modal: 'share' }, '', '');
}
function closeShareModal(triggeredByPop = false) {
  shareModal.classList.add('hidden');
  shareModal.setAttribute('aria-hidden', 'true');
  if (!triggeredByPop && history.state && history.state.modal === 'share') {
    history.back();
  }
}
btnShare.onclick = openShare;
closeShare.onclick = () => closeShareModal(false);
shareModal.addEventListener('click', e => { 
    if (e.target === shareModal) closeShareModal(false); 
});

// системный шаринг и копирование
shareNative.onclick = async () => {
  if (navigator.share) {
    try {
      await navigator.share({ title: document.title, url: location.href });
      shareMsg.textContent = 'Ссылка отправлена.';
    } catch {
      shareMsg.textContent = 'Отмена пользователем.';
    }
  } else {
    shareMsg.textContent = 'Системный шаринг не поддерживается.';
  }
};
shareCopy.onclick = async () => {
  try {
    await navigator.clipboard.writeText(location.href);
    shareMsg.textContent = 'Ссылка скопирована!';
  } catch {
    shareMsg.textContent = 'Ошибка копирования.';
  }
};

// --- QR modal ---
function openQRModal() {
  closeShareModal(false);
  qrModal.classList.remove('hidden');
  qrModal.setAttribute('aria-hidden', 'false');
  history.pushState({ modal: 'qr' }, '', '');
}
function closeQRModal(triggeredByPop = false) {
  qrModal.classList.add('hidden');
  qrModal.setAttribute('aria-hidden', 'true');
  if (!triggeredByPop && history.state && history.state.modal === 'qr') {
    history.back();
  }
}
btnQR.onclick = openQRModal;
closeQR.onclick = () => closeQRModal(false);
qrModal.addEventListener('click', e => { 
    if (e.target === qrModal) closeQRModal(false); 
});

// --- Общая обработка Esc и popstate ---
// Esc закрывает модалки / fullscreen
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    // Esc сам по себе вызовет popstate, если модалка открыта, 
    // поэтому достаточно просто вызвать закрытие без history.back() внутри.
    closeShareModal(false);
    closeQRModal(false);
    if (inFullscreen) closeFullscreen(false); 
  }
});

// Popstate: когда пользователь нажал "назад" — закрываем модалки и fullscreen
window.addEventListener('popstate', (e) => {
  // Если state изменился, и модалка/фулскрин открыты, закрываем их
  if (!shareModal.classList.contains('hidden')) closeShareModal(true);
  if (!qrModal.classList.contains('hidden')) closeQRModal(true);
  if (inFullscreen) closeFullscreen(true);
  
  // Если в history.state.modal ничего нет, это просто возврат на предыдущую страницу
  // (например, при первом нажатии "назад" в браузере, после открытия модалки)
});

// --- Проверка наличия QR-изображения и скрытие кнопки если нет ---
// Функция присутствует только один раз
function checkQrImage(path) {
  if (!btnQR) return;
  btnQR.style.display = 'none'; // по умолчанию скрываем
  const im = new Image();
  im.onload = () => { btnQR.style.display = 'inline-block'; };
  im.onerror = () => { btnQR.style.display = 'none'; };
  im.src = path + '?v=' + Date.now(); // cache-buster
}

// --- Инициализация ---
window.addEventListener('DOMContentLoaded', () => {
  // Принудительно закрываем модалки, если вдруг открыты
  [shareModal, qrModal, fsOverlay, descPopup].forEach(el => {
    if (el) el.classList.add('hidden');
  });

  // Сбрасываем историю
  if (history.replaceState) {
    history.replaceState({}, '', location.href);
  }

  // Проверяем наличие QR изображения
  checkQrImage('icon/qr.png');

  // Устанавливаем стартовое состояние
  btnHome.classList.add('active');
  showSection(homeSection);

  if (typeof photos !== 'undefined' && photos.length > 0) {
    showPhoto(0);
  } else {
    // Скрываем все элементы управления галереи, если нет фото
    [prevBtn, nextBtn, infoBtn, playBtn, fsBtn].forEach(b => {
        if(b) b.style.display = 'none';
    });
  }
});