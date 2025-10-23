// script.js - обновлённый
const fallbackImage = 'foto/notfound.jpg';

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
  // если картинка не загрузилась — показываем fallback и alt с сообщением
  img.src = fallbackImage;
  img.alt = 'Изображение не найдено';
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
    playBtn.textContent = '▶';
  } else {
    autoSlide = setInterval(() => showPhoto(current + 1), 3000);
    playBtn.textContent = '⏸';
  }
};

// fullscreen open/close with history handling
function openFullscreen() {
   if (!img.src) return;
  fsImage.src = img.src;
  fsOverlay.classList.remove('hidden');
  fsOverlay.style.display = 'flex';
  // добавим класс анимации к изображению, потом уберём по событию
  fsImage.classList.remove('fs-enter');       // сброс на всякий
  // небольшой таймаут, чтобы браузер успел применить display, и анимация сработала
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      fsImage.classList.add('fs-enter');
    });
  });

  inFullscreen = true;
  history.pushState({ modal: 'fullscreen' }, '', '');
}

function closeFullscreen(triggeredByPop = false) {
  // убираем анимационный класс
  fsImage.classList.remove('fs-enter');
  fsOverlay.classList.add('hidden');
  fsOverlay.style.display = 'none';
  inFullscreen = false;
  if (!triggeredByPop && history.state && history.state.modal === 'fullscreen') {
    history.back();
  }
}

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

// Обработаем popstate: если пришёл pop и fullscreen открыт — закроем (triggeredByPop=true)
window.addEventListener('popstate', (e) => {
  if (inFullscreen) closeFullscreen(true);

  // остальные модалки уже обрабатываются в основном popstate-обработчике
});

fsBtn.onclick = openFullscreen;
fsClose.onclick = () => closeFullscreen(false);
fsOverlay.addEventListener('click', e => { if (e.target === fsOverlay) closeFullscreen(false); });

// --- Разделы ---
function showSection(section) {
  [homeSection, videoSection, gallerySection].forEach(el => el.classList.add('hidden'));
  section.classList.remove('hidden');
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
  showPhoto(0);
};

// --- Поделиться (modal) ---
function openShare() {
  // Закрываем QR, если открыт
  closeQRModal(false);
  shareMsg.textContent = '';
  shareModal.classList.remove('hidden');
  // добавляем запись в историю чтобы "назад" закрывал модалку
  history.pushState({ modal: 'share' }, '', '');
}
function closeShareModal(triggeredByPop = false) {
  shareModal.classList.add('hidden');
  // если закрыли вручную и это был state - откатим его
  if (!triggeredByPop && history.state && history.state.modal === 'share') {
    history.back();
  }
}
btnShare.onclick = openShare;
closeShare.onclick = () => closeShareModal(false);
shareModal.addEventListener('click', e => { if (e.target === shareModal) closeShareModal(false); });

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
  history.pushState({ modal: 'qr' }, '', '');
}
function closeQRModal(triggeredByPop = false) {
  qrModal.classList.add('hidden');
  if (!triggeredByPop && history.state && history.state.modal === 'qr') {
    history.back();
  }
}
btnQR.onclick = openQRModal;
closeQR.onclick = () => closeQRModal(false);
qrModal.addEventListener('click', e => { if (e.target === qrModal) closeQRModal(false); });

// --- Общая обработка Esc и popstate ---
// Esc закрывает модалки / fullscreen
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    // при закрытии вручную мы попытаемся откатить историю, если нужно
    closeShareModal(false);
    closeQRModal(false);
    if (inFullscreen) closeFullscreen(false);
  }
});

// Popstate: когда пользователь нажал "назад" — закрываем модалки и fullscreen,
// но указываем флаг triggeredByPop=true чтобы не вызывать history.back() снова.
window.addEventListener('popstate', (e) => {
  // Если state говорит, что модалка открыта — просто синхронизируем (обычно не требуется)
  // Мы всегда закрываем открытые модалки при popstate:
  if (!shareModal.classList.contains('hidden')) closeShareModal(true);
  if (!qrModal.classList.contains('hidden')) closeQRModal(true);
  if (inFullscreen) closeFullscreen(true);
});

// --- Проверка наличия QR-изображения и скрытие кнопки если нет ---
function checkQrImage(path) {
  if (!btnQR) return;
  btnQR.style.display = 'none'; // по умолчанию скрываем до проверки
  const im = new Image();
  im.onload = () => { btnQR.style.display = 'inline-block'; };
  im.onerror = () => { btnQR.style.display = 'none'; };
  im.src = path + '?v=' + Date.now(); // cache-buster
}

// --- Проверка наличия QR-изображения и скрытие кнопки если нет ---
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
    if (!el) return;
    el.classList.add('hidden');
    // Убираем прямое вмешательство в style — позволяем CSS управлять display
  });

  // Сбрасываем историю
  try {
    history.replaceState({}, '', location.href);
  } catch (err) {}

  // Проверяем наличие QR изображения (правильная папка icon/)
  checkQrImage('icon/qr.png');

  // Устанавливаем стартовое состояние
  btnHome.classList.add('active');
  showSection(homeSection);

  if (typeof photos !== 'undefined' && photos.length > 0) {
    showPhoto(0);
  } else {
    [prevBtn, nextBtn, infoBtn].forEach(b => (b.style.display = 'none'));
  }
});
