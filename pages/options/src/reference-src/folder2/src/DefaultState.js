export const defaultState = {
  speechRecognitionErr: null,

  isPopupActive: false,
  popupId: null,
  popupType: null, // iframe, window, panel

  iframePos: {
    left: 0,
    top: 0,
  },
  iframeSize: {
    height: 0,
    width: 0,
  },

  /* null: default state, 0: stop scrolling, 1: single scroll, 2: continous scroll */
  isIframeScrollUp: null,
  isIframeScrollDown: null,

  isIframeMouseOver: null,

  windowPopup: {
    height: 0,
    width: 0,
    left: 0,
    top: 0,
  },
};
