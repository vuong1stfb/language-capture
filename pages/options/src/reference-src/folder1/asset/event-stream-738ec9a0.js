import { aT as d } from './theme-2a09837f.js';
function u(e, ...r) {}
async function w() {
  var l, s;
  const e = 'en',
    r = 'ru',
    a = `She ran as fast as she could, but the zombies were closing in. 
        She reached the door, but it was locked. She looked for a key, but there was none. 
        She heard a growl behind her. She turned around and saw a familiar face. 
        It was her husband, but he was not himself. He was one of them.`,
    n =
      'https://translate.googleapis.com/translate_a/single?client=gtx&dt=t&sl=' +
      encodeURIComponent(e) +
      '&tl=' +
      encodeURIComponent(r) +
      '&q=' +
      encodeURIComponent(a);
  try {
    let t = await fetch(n),
      o = await t.json();
    if (
      t.ok &&
      o &&
      ((s = (l = o == null ? void 0 : o[0]) == null ? void 0 : l[0]) == null ? void 0 : s[0]) !== void 0
    ) {
      let c = '';
      return (
        o[0].forEach(i => {
          i[0] && (c += i[0]);
        }),
        u('[ST:API:res] translate_a:', c),
        !0
      );
    }
    console.error('[ST:API:error] ' + JSON.stringify(o));
  } catch (t) {
    return console.error('[ST:API:error] ' + t), !1;
  }
  return !1;
}
async function g(e) {
  const r = 'https://translate.googleapis.com/translate_a/single?client=gtx&dj=1&sl=auto&q=' + encodeURIComponent(e);
  try {
    let n = await (await fetch(r)).json();
    if (n !== void 0) {
      let l = n.src;
      return u('[ST:API:res] detectLang:', l), l;
    }
    console.error('[ST:API:error] ' + JSON.stringify(n));
  } catch (a) {
    console.error('[ST:API:error] ' + a);
  }
}
async function h(e, r, a) {
  var l, s;
  const n =
    'https://translate.googleapis.com/translate_a/single?client=gtx&dt=t&sl=' +
    encodeURIComponent(r) +
    '&tl=' +
    encodeURIComponent(a) +
    '&q=' +
    encodeURIComponent(e);
  try {
    let t = await fetch(n),
      o = await t.json();
    if (
      t.ok &&
      o &&
      ((s = (l = o == null ? void 0 : o[0]) == null ? void 0 : l[0]) == null ? void 0 : s[0]) !== void 0
    ) {
      let c = '';
      return (
        o[0].forEach(i => {
          i[0] && (c += i[0]);
        }),
        u('[ST:API:res] translate_a:', c),
        c
      );
    }
    console.error('[ST:API:error] ' + JSON.stringify(o));
  } catch (t) {
    console.error('[ST:API:error] ' + t);
  }
}
async function S(e, r, a, n) {
  const l =
    'https://script.google.com/macros/s/' +
    n +
    '/exec?source=' +
    encodeURIComponent(r) +
    '&target=' +
    encodeURIComponent(a) +
    '&text=' +
    encodeURIComponent(e);
  try {
    let s = await fetch(l),
      t = await s.text();
    if (s.ok && t) return u('[ST:API:res] translate_gs:', t), t;
  } catch (s) {
    console.error('[ST:API:error] ' + s);
  }
}
async function T(e, r, a, n, l = !1, s = 'google') {
  let t;
  if (((n = n.toLowerCase().trim()), l)) {
    const i = n.slice(0, 6);
    t = new URL(`https://st-api-${i}.kappaflow.dev/translate/`);
  } else t = new URL('https://st-api.kappaflow.dev/translate/');
  const o = { api_key: n, query_text: e, translator: s, from_language: r, to_language: a };
  u(`body: ${JSON.stringify(o)}`);
  const c = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(o),
  };
  try {
    let p = await (await fetch(t, c)).json();
    if (p != null && p.is_success) {
      const f = p.translated_text;
      return u('[ST:API:res] translateProxyApi:', f), f;
    }
    console.error('[ST:API:error] ' + JSON.stringify(p));
  } catch (i) {
    console.error('[ST:API:error] ' + i);
  }
}
const x = { detectLang: g, translate_a: h, translate_gs: S, translateProxyApi: T };
function y(e, ...r) {}
function m(e) {
  return d.find(r => r.code === e.translate_lang);
}
function O(e) {
  var n;
  let r = {
      settings: {
        langCss: {
          original: (n = m(e.speechLang)) == null ? void 0 : n.font_class_css,
          translated: e.translateLang.font_class_css,
        },
        isOutputInterimTranslation: e.isOutputInterimTranslation,
        isOutputOriginalText: e.isOutputOriginalText,
        isOutputTranslatedText: e.isOutputTranslatedText,
        fontSize: e.popupFontSize,
        bgOpacity: e.popupFrameOpacity,
        isTextOutline: e.isPopupTextOutline,
        isTextAlignCenter: e.isPopupTextAlignCenter,
        isHideDividerLines: e.isPopupHideDividerLines,
        expertFinalTranslationCountLimit: e.expertFinalTranslationCountLimit,
      },
    },
    a = {
      overlayMode: {
        bgColor: e.popupOverlayBgColor,
        textColor: e.popupOverlayTextColor,
        isTextShadow: e.isPopupOverlayTextShadow,
        isTextOutline: e.isPopupOverlayTextOutline,
      },
    };
  return e.isPopupOverlayMode && Object.assign(r.settings, a), r;
}
async function P(e, r, a = null) {
  const n = O(r),
    l = a ? Object.assign(a, n) : n;
  try {
    let t = await (
      await fetch(e, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(l) })
    ).json();
    if (t !== void 0) return y('[ST:API:eventStream] Result:', t), t;
    console.error('[ST:API:eventStream:error] ' + JSON.stringify(t));
  } catch (s) {
    console.error('[ST:API:eventStream:error] ' + s);
  }
}
function A(e, r) {
  return new URL(e.replace('<id>', r.slice(0, 6)));
}
export { A as a, x as b, w as checkGoogleTranslate, P as e, h as t };
