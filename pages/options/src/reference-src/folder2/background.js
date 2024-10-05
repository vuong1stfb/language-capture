// @ts-check
/// <reference types="chrome" />

import { defaultSettings } from './src/DefaultSettings.js';
import { defaultState } from './src/DefaultState.js';
import { speechLangList } from './src/SpeechLangList.js';
import { translateLangList } from './src/TranslateLangList.js';

import { detectLang } from './src/modules/translate.js';

import { eventStream, convertPrivateServerURL } from './src/modules/event-stream.js';

//set badge after chrome startup
addIconBadge();

chrome.runtime.onInstalled.addListener(details => {
  getLocalStorage().then(state => {
    //restart the page if iframe was inserted before the ext restart
    if (state?.popupId && state?.popupType === 'iframe') chrome.tabs.reload(state.popupId);

    chrome.storage.local.set(defaultState);
  });

  chrome.contextMenus.removeAll(() => {
    addIconBadge();
    addDetectLangContextButton();
    addSpeechRecognitionContextButton();
  });

  switch (details.reason) {
    case chrome.runtime.OnInstalledReason.INSTALL: {
      chrome.storage.sync.set(defaultSettings).then(() => {
        setCurrentExtVersion();
        setPreferedTranslateToLang();
        initDonationReminder();
      });
      chrome.tabs.create({ url: chrome.runtime.getURL('options.html#instruction') });
      return;
    }
    case chrome.runtime.OnInstalledReason.UPDATE: {
      // Set ext version ReleaseNote was made for
      initReleaseNote('0.2.0').then(() => {
        setCurrentExtVersion();
      });
      initDonationReminder();
    }
  }
});

// End listening if sidepanel was closed using browser interface
chrome.runtime.onConnect.addListener(port => {
  if (port.name === 'keepAlive') {
    port.onDisconnect.addListener(() => {
      getLocalStorage().then(state => {
        if (state.isPopupActive) {
          requestClosePopup();
        }
      });
    });
  }
});

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && changes?.speechLang?.newValue) {
    setBadgeText(changes?.speechLang.newValue.speech_lang);
  }

  if (namespace === 'local' && changes?.isPopupActive) {
    if (changes?.isPopupActive.newValue !== changes?.isPopupActive.oldValue) {
      toggle(changes.isPopupActive.newValue);
      updateSpeechRecognitionContextButton(changes?.isPopupActive.newValue);
      setBadgeColor(changes?.isPopupActive.newValue);
    }
  }

  //update streaming widget settings
  if (namespace === 'sync') {
    getStorage().then(storage => {
      const settings = storage.settings;
      if (settings.isStreamingMode && storage.state.isPopupActive) {
        let privateKey, pushURL;
        if (settings.streamingServer.abbr === 'personal_server') {
          privateKey = settings.personalStreamingServerPrivateKey;
          pushURL = convertPrivateServerURL(
            settings.streamingServer.pushURL,
            settings.personalStreamingServerPublicKey,
          );
        } else {
          privateKey = settings.streamingPrivateKey;
          pushURL = settings.streamingServer?.pushURL;
        }

        eventStream(new URL(privateKey, pushURL), settings);
      }
    });
  }

  /****/

  function toggle(isPopupCreating) {
    getStorage().then(storage => {
      const popupType = storage.state.popupType;
      const popupId = storage.state.popupId;

      if (isPopupCreating) {
        if (popupType !== 'panel') chrome.sidePanel.setOptions({ enabled: false });

        if ((storage.settings.isOutputPopupWindow && popupType !== 'panel') || popupType === 'window') {
          createWindow(storage);
        } else if (popupType === 'panel') {
          // Sidepanel open event
        } else {
          createFrame().catch(e => {
            if (e instanceof FrameInjectionError) {
              console.log('[ST:warning] ' + e.message + ' Opening Popup window instead.');
              createWindow(storage);
            } else {
              throw e;
            }
          });
        }
      } else {
        if (popupType === 'iframe' && popupId) {
          chrome.storage.local.set({ isIframeMouseOver: null }).then(() => {
            closeFrame(popupId);
          });
        } else if (popupType === 'window' && popupId) {
          chrome.windows.remove(popupId).catch(error => {
            // Window has already been closed
            //console.log('[ST:warning] ' + error)
          });
        } else if (popupType === 'panel' && popupId) {
          // Sidepanel close event (but closes from inside)
        }
        chrome.sidePanel.setOptions({ enabled: true });
        chrome.storage.local.set({ popupType: null, popupId: null });
      }
    });
  }

  function createWindow(storage) {
    chrome.system.display.getInfo(function (display_properties) {
      let popupSize = {
        height: 0,
        width: 0,
        left: 0,
        top: 0,
      };
      let primary_disp = display_properties[0];
      for (const element of display_properties) {
        if (element.isPrimary) {
          primary_disp = element;
        }
      }

      const popupSizeDefault = {
        height: 180,
        width: primary_disp.bounds.width,
        left: 0,
        top: primary_disp.bounds.height - 200,
      };

      if (Object.values(storage.state.windowPopup).some(value => value !== 0)) {
        popupSize = storage.state.windowPopup;
      } else {
        popupSize = popupSizeDefault;
      }

      windowsCreate(popupSize).catch(error => {
        console.error('[ST:error] ' + error);
        windowsCreate(popupSizeDefault);
      });

      function windowsCreate(popupSize) {
        return new Promise((resolve, reject) => {
          chrome.windows
            .create({
              url: 'popup.html',
              type: 'popup',
              left: popupSize.left,
              top: popupSize.top,
              width: popupSize.width,
              height: popupSize.height,
              focused: true,
            })
            .then(async window => {
              await chrome.storage.local.set({ popupType: 'window', popupId: window.id });
              resolve(true);
            })
            .catch(err => {
              reject(err);
            });
        });
      }
    });
  }

  function createFrame() {
    return new Promise((resolve, reject) => {
      getCurrentTab().then(tab => {
        if (
          tab &&
          (tab.url?.startsWith('http://') || tab.url?.startsWith('https://')) &&
          tab?.id !== undefined &&
          !isMetaDomain(tab.url)
        ) {
          const _tabid = tab.id;
          chrome.scripting
            .insertCSS({
              target: {
                tabId: _tabid,
              },
              files: ['insert_css/cs_popup.css'],
            })
            .then(() => {
              chrome.scripting
                .executeScript({ target: { tabId: _tabid }, files: ['insert_js/cs_popup.js'] })
                .then(() => {
                  chrome.storage.local.set({ popupType: 'iframe', popupId: _tabid });
                });
            });
          resolve(true);
        } else {
          reject(new FrameInjectionError("Can't open iframe in this context."));
        }
      });
    });

    async function getCurrentTab() {
      const queryOptions = { active: true, lastFocusedWindow: true };
      const [tab] = await chrome.tabs.query(queryOptions);

      return tab;
    }
  }

  function closeFrame(_tabid) {
    chrome.scripting
      .executeScript({ target: { tabId: _tabid }, files: ['insert_js/cs_popup.js'] })
      .then(() => {
        chrome.scripting.removeCSS({
          target: {
            tabId: _tabid,
          },
          files: ['insert_css/cs_popup.css'],
        });
        chrome.storage.local.set({ popupType: null, popupId: null });
      })
      .catch(e => {
        console.error("[ST:error] Can't close the iframe. Make sure you don't have it running in another tab.");
        if (_tabid) chrome.tabs.reload(_tabid);
      });
  }

  function FrameInjectionError(message) {
    this.message = message;
    this.name = 'FrameInjectionError';
  }
});

chrome.contextMenus.onClicked.addListener(detectLangMenuItemListener);
chrome.contextMenus.onClicked.addListener(speechRecMenuItemListener);

chrome.commands.onCommand.addListener(function (command) {
  switch (command) {
    case 'listen':
      listen();
      return;
  }
});

/******************/

async function getStorage() {
  const storage = {};
  await Promise.all([
    chrome.storage.local.get(defaultState).then(state => {
      storage.state = state;
    }),
    chrome.storage.sync.get(defaultSettings).then(settings => {
      storage.settings = settings;
    }),
  ]);
  return storage;
}

function getLocalStorage() {
  return chrome.storage.local.get(defaultState);
}

function getSyncStorage() {
  return chrome.storage.sync.get(defaultSettings);
}

function listen() {
  getLocalStorage().then(state => {
    if (!state.isPopupActive) {
      requestOpenPopup();
    } else {
      requestClosePopup();
    }
  });
}

async function requestOpenPopup() {
  chrome.storage.local.set({ isPopupActive: true });
}
async function requestClosePopup() {
  chrome.storage.local.set({ isPopupActive: false });
}

function addDetectLangContextButton() {
  chrome.contextMenus.create({
    id: 'detectLang',
    title: 'Detect Language',
    contexts: ['selection'],
  });
}

function addIconBadge() {
  getSyncStorage().then(settings => {
    getLocalStorage().then(state => {
      setBadgeColor(state.isPopupActive);
      setBadgeText(settings.speechLang.speech_lang);
    });
  });
}

function addSpeechRecognitionContextButton() {
  getStorage().then(storage => {
    if (storage.settings.isContextMenuListenBtn) {
      chrome.contextMenus.create({
        id: 'speechRec',
        title: listeningButtonTitle(storage.state.isPopupActive),
        contexts: ['page', 'frame', 'link', 'editable', 'image', 'video', 'audio', 'action'],
      });
    }
  });
}

function updateSpeechRecognitionContextButton(isStop = false) {
  getSyncStorage().then(settings => {
    if (settings.isContextMenuListenBtn) {
      chrome.contextMenus.update('speechRec', {
        title: listeningButtonTitle(isStop),
      });
    }
  });
}

function listeningButtonTitle(isStop = false) {
  return (isStop ? 'Stop' : 'Start') + ' Listening';
}

function speechRecMenuItemListener(clickData) {
  if (clickData.menuItemId === 'speechRec') listen();
}

function detectLangMenuItemListener(clickData) {
  if (clickData.menuItemId === 'detectLang' && clickData.selectionText) {
    detectLang(clickData.selectionText).then(detectedLang => {
      const speechLang = findPrimarySpeechLang(detectedLang);
      if (speechLang) {
        getSyncStorage().then(settings => {
          if (speechLang.translate_lang === settings.translateLang.code) {
            const invertedTranslateLang = findTranslateLang(settings.speechLang);
            if (invertedTranslateLang) {
              chrome.storage.sync.set({ speechLang: speechLang, translateLang: invertedTranslateLang });
            }
          } else {
            chrome.storage.sync.set({ speechLang: speechLang });
          }
          chrome.notifications.create({
            type: 'basic',
            title: 'Speech Translator',
            message: 'Speech Language set to ' + speechLang.name,
            silent: true,
            iconUrl: 'icon-128.png',
            requireInteraction: false,
          });
        });
      }
    });
  }

  function findPrimarySpeechLang(lang) {
    return speechLangList.find(languageItem => languageItem.translate_lang === lang && languageItem.is_primary);
  }

  function findTranslateLang(speechLang) {
    return translateLangList.find(lang => lang.code === speechLang.translate_lang && speechLang.is_primary);
  }
}

function setBadgeText(_text) {
  const shortText = _text.split('-')[0];
  chrome.action.setBadgeText({
    text: shortText,
  });
}

function setBadgeColor(isStop = false) {
  const badgeColor = isStop ? '#DD2C00' : '#2962FF';
  chrome.action.setBadgeBackgroundColor({
    color: badgeColor,
  });
}

function setPreferedTranslateToLang() {
  const UI_LANG = chrome.i18n.getUILanguage();
  if (!UI_LANG.includes('en-')) {
    const defaultTranslateLang = translateLangList.find(
      lang => lang.google_code && lang.google_code.includes(UI_LANG.split('-')[0]),
    );
    if (defaultTranslateLang) chrome.storage.sync.set({ translateLang: defaultTranslateLang });
  }
}

function initDonationReminder() {
  getSyncStorage().then(settings => {
    chrome.storage.sync.set({
      donationReminderPeriod: defaultSettings.donationReminderPeriod,
    });

    if (!settings.lastDonationReminderDateMs) {
      chrome.storage.sync.set({
        lastDonationReminderDateMs: Date.now(),
      });
    }
  });
}

function setCurrentExtVersion() {
  const manifestVer = chrome.runtime.getManifest().version;
  chrome.storage.sync.set({ extVersion: manifestVer });
}

async function initReleaseNote(releaseNoteVer) {
  const manifestVer = chrome.runtime.getManifest().version;
  getSyncStorage().then(settings => {
    // Show release note only if previous version is unknown or
    // previous version is not equal to the current version
    // and previous version is smaller, than releaseNote message
    // and releaseNote version <= current version
    if (
      !settings.extVersion ||
      (compareVersions(settings.extVersion, releaseNoteVer) === -1 &&
        (compareVersions(releaseNoteVer, manifestVer) === -1 || compareVersions(releaseNoteVer, manifestVer) === 0) &&
        settings.extVersion !== manifestVer)
    ) {
      chrome.storage.sync.set({ isExtUpdated: true });
    }
  });

  function compareVersions(a, b) {
    // (a > b) === 1
    // (a < b) === -1
    // (a === b) === 0
    let arrA = a.split('.').map(Number);
    let arrB = b.split('.').map(Number);
    for (let i = 0; i < Math.max(arrA.length, arrB.length); i++) {
      let partA = arrA[i] || 0;
      let partB = arrB[i] || 0;

      if (partA > partB) return 1;
      if (partA < partB) return -1;
    }
    return 0;
  }
}

function isMetaDomain(_url) {
  const META_DOMAINS = [
    'meta.com',
    'whatsapp.com',
    'messenger.com',
    'workplace.com',
    'facebook.com',
    'instagram.com',
    'threads.net',
    'mapillary.com',
    'oculus.com',
  ];

  const hostname = new URL(_url).hostname;

  return META_DOMAINS.some(checkElement);

  function checkElement(element, index, array) {
    return hostname.includes(element);
  }
}
