import { translateLangList } from './TranslateLangList.js';
import { speechLangList } from './SpeechLangList.js';
import { translateServiceList } from './TranslateServiceList.js';
import { widgetServerList } from './WidgetServerList.js';

export const defaultSettings = {
  speechLang: speechLangList.find(lang => lang.speech_lang === 'en-US'),

  translateLang: translateLangList.find(lang => lang.code === 'ru'),

  interimTranslateService: translateServiceList.find(service => service.abbr === 'google_public'),
  finalTranslateService: translateServiceList.find(service => service.abbr === 'google_public'),

  googleScriptApiKey: null,
  isDifferentInterimTranslateService: false,
  isOutputInterimTranslation: true,

  isOutputPopupWindow: false,

  isOutputNotificationTranscript: false, // Deprecated

  isOutputOriginalText: true,
  isOutputTranslatedText: true,

  isHideInterimText: false,

  isOutputConsoleOriginalText: false,
  isOutputConsoleTranslatedText: false,

  popupFontSize: 100,
  popupFrameOpacity: 0.7,

  isPopupTextOutline: false,
  isPopupTextAlignCenter: false,
  isPopupHideDividerLines: false,

  isPopupOverlayMode: false,
  popupOverlayBgColor: '#00ff00ff',
  popupOverlayTextColor: '#ffffff',
  isPopupOverlayTextShadow: true,
  isPopupOverlayTextOutline: false,

  isDarkMode: true,
  isContextMenuListenBtn: true,
  isHideTranslationTip: false,

  isExtUpdated: false,
  extVersion: null, // to be able to check version before the update

  lastDonationReminderDateMs: null,
  donationReminderPeriod: '1,week', //https://day.js.org/docs/en/manipulate/add#list-of-all-available-units

  //streaming widget
  isStreamingMode: false,
  isStreamingModeConsented: false,
  streamingPrivateKey: null,
  streamingPublicKey: null,
  streamingServer: widgetServerList.find(server => server.abbr === 'auto_select'),
  isHideStreamingModeWarning: false,

  //premium options
  sharedTranslationApiKey: null,

  isEnabledPersonalTranslationServer: false,
  personalTranslationApiKey: null,

  personalStreamingServerPrivateKey: null,
  personalStreamingServerPublicKey: null, //generates on adding personalStreamingServerPrivateKey

  //expert options
  expertInterimCharsLimit: 265, //50-5000; google, papago translate up to 5,000 characters
  expertStreamingModeInterimCharsLimit: 125, //50-5000; when Streaming Mode is active
  expertTranslationDelayMs: 1000, //500-3000
  expertFinalTranslationCountLimit: 50, //1-9999
};
