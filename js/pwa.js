let deferredPrompt;

function isIos() {
  const userAgent = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent);
}

function isInStandaloneMode() {
  return ('standalone' in window.navigator) && (window.navigator.standalone);
}

async function showInstallPrompt() {
  if (!deferredPrompt) {
    return;
  }
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  console.log(`User response to the install prompt: ${outcome}`);
  
  document.getElementById('pwaInstallBanner').style.display = 'none';
  deferredPrompt = null;
}

export function initPwa() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => console.log('Service Worker registered with scope:', registration.scope))
      .catch(error => console.log('Service Worker registration failed:', error));
  }

  const installBanner = document.getElementById('pwaInstallBanner');
  const installButtonBanner = document.getElementById('installPwaBtn');
  const closeButton = document.getElementById('closePwaBannerBtn');
  const iosInstructions = document.getElementById('iosInstallInstructions');

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    if (!isIos()) {
      installBanner.style.display = 'flex';
      installButtonBanner.style.display = 'block';
      iosInstructions.style.display = 'none';
    }
  });

  if (isIos() && !isInStandaloneMode()) {
    installBanner.style.display = 'flex';
    installButtonBanner.style.display = 'none';
    iosInstructions.style.display = 'block';
  }

  installButtonBanner.addEventListener('click', showInstallPrompt);

  closeButton.addEventListener('click', () => {
    installBanner.style.display = 'none';
  });

  window.addEventListener('appinstalled', () => {
    console.log('PWA was installed');
    installBanner.style.display = 'none';
    deferredPrompt = null;
  });
}