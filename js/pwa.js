let deferredPrompt;
let newWorker;

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
  
  const banner = document.getElementById('pwaInstallBanner');
  banner.style.display = 'none';
  deferredPrompt = null;
}

function showUpdateToast(worker) {
  newWorker = worker;
  const toast = document.getElementById('pwaUpdateToast');
  if (toast) {
    toast.classList.remove('hidden');
    // Small delay to allow display block to apply before transition
    setTimeout(() => {
      toast.classList.remove('translate-y-10', 'opacity-0');
    }, 10);
  }
}

export function initPwa() {
  // --- Service Worker Registration with Update Flow ---
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then(registration => {
      console.log('Service Worker registered with scope:', registration.scope);

      // Check if there is already a waiting worker
      if (registration.waiting) {
        showUpdateToast(registration.waiting);
        return;
      }

      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // New update available
              console.log('New content is available; please refresh.');
              showUpdateToast(installingWorker);
            } else {
              // Content is cached for the first time
              console.log('Content is cached for offline use.');
            }
          }
        };
      };
    }).catch(error => console.log('Service Worker registration failed:', error));

    // Reload page when the new service worker takes control
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });
  }

  // --- UI Elements ---
  const installBanner = document.getElementById('pwaInstallBanner');
  const installButtonBanner = document.getElementById('installPwaBtn');
  const closeButton = document.getElementById('closePwaBannerBtn');
  const iosInstructions = document.getElementById('iosInstallInstructions');
  
  const updateToast = document.getElementById('pwaUpdateToast');
  const updateButton = document.getElementById('updatePwaBtn');
  const closeUpdateToastBtn = document.getElementById('closeUpdateToastBtn');

  // --- Install Banner Logic ---
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    if (!isIos()) {
      // Delay display by 10 seconds as requested
      setTimeout(() => {
        installBanner.style.display = 'flex';
        installButtonBanner.style.display = 'block';
        iosInstructions.style.display = 'none';
      }, 10000);
    }
  });

  if (isIos() && !isInStandaloneMode()) {
    setTimeout(() => {
      installBanner.style.display = 'flex';
      installButtonBanner.style.display = 'none';
      iosInstructions.style.display = 'block';
    }, 10000);
  }

  if (installButtonBanner) {
    installButtonBanner.addEventListener('click', showInstallPrompt);
  }

  if (closeButton) {
    closeButton.addEventListener('click', () => {
      installBanner.style.display = 'none';
    });
  }

  window.addEventListener('appinstalled', () => {
    console.log('PWA was installed');
    installBanner.style.display = 'none';
    deferredPrompt = null;
  });

  // --- Update Toast Logic ---
  if (updateButton) {
    updateButton.addEventListener('click', () => {
      if (newWorker) {
        newWorker.postMessage({ type: 'SKIP_WAITING' });
      }
    });
  }

  if (closeUpdateToastBtn) {
    closeUpdateToastBtn.addEventListener('click', () => {
        if (updateToast) {
            updateToast.classList.add('translate-y-10', 'opacity-0');
            setTimeout(() => {
                updateToast.classList.add('hidden');
            }, 300);
        }
    });
  }
}