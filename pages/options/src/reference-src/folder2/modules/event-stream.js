import { translateLangList } from '../TranslateLangList.js';

const IS_DEBUGGING = false;

function log(str, ...args) {
  if (IS_DEBUGGING) console.log(str, args);
}

function getTranslateLang(speechLang) {
  return translateLangList.find(languageItem => languageItem.code === speechLang.translate_lang);
}

function mapSettingsObj(_settings) {
  let settingsObj = {
    settings: {
      langCss: {
        original: getTranslateLang(_settings.speechLang)?.font_class_css,
        translated: _settings.translateLang.font_class_css,
      },

      isOutputInterimTranslation: _settings.isOutputInterimTranslation,

      isOutputOriginalText: _settings.isOutputOriginalText,
      isOutputTranslatedText: _settings.isOutputTranslatedText,

      fontSize: _settings.popupFontSize,
      bgOpacity: _settings.popupFrameOpacity,
      isTextOutline: _settings.isPopupTextOutline,

      isTextAlignCenter: _settings.isPopupTextAlignCenter,

      isHideDividerLines: _settings.isPopupHideDividerLines,

      expertFinalTranslationCountLimit: _settings.expertFinalTranslationCountLimit,
    },
  };

  let overlayModeObj = {
    overlayMode: {
      bgColor: _settings.popupOverlayBgColor,
      textColor: _settings.popupOverlayTextColor,
      isTextShadow: _settings.isPopupOverlayTextShadow,
      isTextOutline: _settings.isPopupOverlayTextOutline,
    },
  };

  if (_settings.isPopupOverlayMode) {
    Object.assign(settingsObj.settings, overlayModeObj);
  }

  return settingsObj;
}

export async function eventStream(url, settings, dataObj = null) {
  const settingsObj = mapSettingsObj(settings);

  const json = dataObj ? Object.assign(dataObj, settingsObj) : settingsObj;

  log('[ST:API:eventStream]', url, json);
  try {
    let res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(json),
    });

    let result = await res.json();

    if (result !== undefined) {
      log('[ST:API:eventStream] Result:', result);

      return result;
    }

    console.error('[ST:API:eventStream:error] ' + JSON.stringify(result));
  } catch (error) {
    console.error('[ST:API:eventStream:error] ' + error);
  }
}

export function convertPrivateServerURL(url, personalPublicKey) {
  return new URL(url.replace('<id>', personalPublicKey.slice(0, 6)));
}

export default { eventStream };
