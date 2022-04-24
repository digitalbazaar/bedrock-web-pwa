/*!
 * Copyright (c) 2022 Digital Bazaar, Inc. All rights reserved.
 */
export const state = {
  _initialized: false,
  deferredInstallPrompt: null,
  installed: false,
  installCapabilities: {
    inApp: false,
    manual: false
  },
  os: 'undetected'
};

// must be called after initialize; method is async to future proof (e.g., to
// allow waiting for install events as needed on different platforms)
export async function canInstall() {
  return state.installCapabilities.inApp || state.installCapabilities.manual;
}

// must be called in initial webpage script
export function initialize() {
  if(state._initialized) {
    throw new Error('Cannot initialize PWA utilities; already initialized.');
  }
  state._initialized = true;

  // determine installed state
  state.installed = _isAndroidPwa() || _isStandalone();

  // determine if manual install is possible
  if(_isIos()) {
    state.os = 'iOS';

    // iOS Safari allows manual install
    const ua = window.navigator.userAgent;
    const webkit = !!ua.match(/WebKit/i);
    const iOSSafari = webkit && !ua.match(/CriOS|FxiOS|OPiOS|mercury|EdgiOS/i);
    if(iOSSafari) {
      state.installCapabilities.manual = true;
    }
  }

  if(typeof window === 'undefined' || !window.BeforeInstallPromptEvent) {
    return;
  }

  // capture the PWA install prompt
  // chromium-based browsers on desktop and android only
  // see https://caniuse.com/mdn-api_beforeinstallpromptevent
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    state.installCapabilities.inApp = true;
    state.deferredInstallPrompt = e;
  }, {once: true});

  window.addEventListener('appinstalled', () => {
    // clear `deferredInstallPrompt` so it can be garbage collected
    state.deferredInstallPrompt = null;
    state.installed = true;
  }, {once: true});
}

export function showInstallPrompt() {
  if(!state.deferredInstallPrompt) {
    throw new Error('No PWA install prompt available.');
  }

  // show prompt and return promise that will resolve when the user responds
  state.deferredInstallPrompt.prompt();
  const promise = state.deferredInstallPrompt.userChoice;
  state.deferredInstallPrompt.userChoice.then(({outcome}) => {
    // update installation state if user accepts
    state.installed = outcome === 'accepted';
  });
  return promise;
}

function _isIos() {
  if(typeof navigator === 'undefined') {
    return false;
  }
  return [
    'iPad Simulator',
    'iPhone Simulator',
    'iPod Simulator',
    'iPad',
    'iPhone',
    'iPod'
  ].includes(navigator.platform);
}

function _isAndroidPwa() {
  return typeof document !== 'undefined' &&
    document.referrer && document.referrer.startsWith('android-app://');
}

function _isStandalone() {
  return ((typeof navigator !== 'undefined' && navigator.standalone) ||
    (typeof window !== 'undefined' &&
      window.matchMedia('(display-mode: standalone)').matches));
}
