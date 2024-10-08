import {
  a7 as T,
  av as f,
  aQ as _,
  aT as L,
  o as h,
  O as u,
  a1 as o,
  L as g,
  c as y,
  V as x,
  a0 as n,
  aZ as S,
  Q as p,
  a2 as m,
  a3 as O,
  a_ as b,
  aR as v,
  aW as I,
  a$ as C,
  b0 as w,
  b1 as P,
  b2 as E,
  b3 as k,
} from './theme-2a09837f.js';
import { b as c, a as M } from './event-stream-738ec9a0.js';
import { translate_a } from '../../folder2/modules/translate.js';
const R = {
    props: ['_settings', '_popupState'],
    data() {
      return {
        SCROLL_STEP: 30,
        ICON: { mdiCog: f },
        popupType: null,
        recognition: null,
        state: {
          status: 'idle',
          interimTranscript: '',
          interimTranslation: '',
          finalTranscript: '',
          finalTranslation: '',
        },
        lastState: null,
        finalStateItems: [],
        settings: this._settings,
        popupState: this._popupState,
        sourceTranslateLang: this.getTranslateLang(this._settings.speechLang),
        lastTranslationTimestamp: null,
        elem: { SINGLE_LINE_MIN_HEIGHT: 3, DOUBLE_LINE_MIN_HEIGHT: 3.75, interim: null, finalLogList: null },
        iframeMouseOverTimer: null,
      };
    },
    watch: {
      state: {
        deep: !0,
        handler(t) {
          this.lastState = _.clone(t);
        },
      },
      'state.finalTranslation'(t) {
        const e = this.settings;
        let s, a;
        this.isFinalDoubleTextLine ? ((s = 'd-none'), (a = '')) : ((s = ''), (a = 'd-none'));
        const i = (
          s +
          ' ' +
          (e.isOutputOriginalText ? this.sourceTranslateLang.font_class_css : '') +
          ' ' +
          (e.isOutputTranslatedText ? e.translateLang.font_class_css : '')
        ).trim();
        this.finalStateItems.unshift({
          isOutputOriginalText: e.isOutputOriginalText,
          isOutputTranslatedText: e.isOutputTranslatedText,
          singleLineDisplayClass: s,
          doubleLineDisplayClass: a,
          singleLineTextClass: i,
          langCssOriginal: this.sourceTranslateLang.font_class_css,
          langCssTranslated: e.translateLang.font_class_css,
          finalTranscript: this.state.finalTranscript,
          finalTranslation: t,
        }),
          this.$nextTick().then(() => {
            (this.elem.interim.style.animation = 'interim__toggle--anim 1s ease-in'),
              (this.elem.finalLogList.style.marginTop = `-${this.getMarginTopAnimShift}px`),
              (this.elem.finalLogList.style.animation = 'final__appearing--anim 2s ease forwards');
          }),
          this.finalStateItems.length > this.settings.expertFinalTranslationCountLimit && this.finalStateItems.pop();
      },
      'settings.speechLang'() {
        (this.sourceTranslateLang = this.getTranslateLang(this.settings.speechLang)), this.stopRecognition();
      },
      'settings.popupFrameOpacity'(t) {
        !this.settings.isPopupOverlayMode &&
          this.popupType === 'iframe' &&
          (document.body.style.backgroundColor = `rgba(0,0,0, ${t})`);
      },
      'settings.isPopupOverlayMode'(t) {
        t ? this.addOverlayMode() : this.removeOverlayMode();
      },
      'settings.popupOverlayBgColor'(t) {
        this.settings.isPopupOverlayMode && (document.body.style.backgroundColor = t);
      },
      'settings.popupOverlayTextColor'(t) {
        this.settings.isPopupOverlayMode && (document.body.style.color = t);
      },
      'settings.isPopupOverlayTextShadow'(t) {
        this.settings.isPopupOverlayMode && t
          ? document.body.classList.add('overlay_mode__body--text_shadow')
          : document.body.classList.remove('overlay_mode__body--text_shadow');
      },
      'settings.isPopupOverlayTextOutline'(t) {
        t
          ? document.body.classList.add('overlay_mode__body--outline_text_shadow')
          : document.body.classList.remove('overlay_mode__body--outline_text_shadow');
      },
      'settings.popupFontSize'(t) {
        document.documentElement.style.fontSize = `${t}%`;
      },
    },
    methods: {
      openOptions() {
        chrome.runtime.openOptionsPage
          ? chrome.runtime.openOptionsPage()
          : window.open(chrome.runtime.getURL('options.html'));
      },
      requestPopUpClose() {
        try {
          chrome.storage.local.set({ isPopupActive: !1 });
        } catch (t) {
          console.error('[ST:error] ' + t.message + ' It might be caused by the extension restart while listening.');
        }
      },
      stateListener() {
        chrome.storage.onChanged.addListener((t, e) => {
          this.popupType === 'iframe' &&
            (this.$nextTick().then(() => {
              if (t != null && t.isIframeScrollUp && e === 'local')
                switch (t.isIframeScrollUp.newValue) {
                  case 0:
                    this.elem.finalLogList.scrollTo(0, this.elem.finalLogList.scrollTop),
                      chrome.storage.local.set({ isIframeScrollUp: null });
                    break;
                  case 1:
                    this.elem.finalLogList.scrollBy(0, -this.SCROLL_STEP);
                    break;
                  case 2:
                    this.elem.finalLogList.scrollBy(0, -(this.SCROLL_STEP * 2));
                    break;
                  case 3:
                    this.elem.finalLogList.scrollTo(0, 0);
                    break;
                }
              if (t != null && t.isIframeScrollDown && e === 'local')
                switch (t.isIframeScrollDown.newValue) {
                  case 0:
                    this.elem.finalLogList.scrollTo(0, this.elem.finalLogList.scrollTop),
                      chrome.storage.local.set({ isIframeScrollDown: null });
                    break;
                  case 1:
                    this.elem.finalLogList.scrollBy(0, this.SCROLL_STEP);
                    break;
                  case 2:
                    this.elem.finalLogList.scrollBy(0, this.SCROLL_STEP * 2);
                    break;
                  case 3:
                    this.elem.finalLogList.scrollTo(0, this.elem.finalLogList.scrollHeight);
                    break;
                }
            }),
            t != null &&
              t.isIframeMouseOver &&
              e === 'local' &&
              this.popupType === 'iframe' &&
              (t.isIframeMouseOver.newValue
                ? (requestAnimationFrame(() => {
                    (document.body.style.paddingTop = null), (this.elem.finalLogList.style.overflow = null);
                  }),
                  clearTimeout(this.iframeMouseOverTimer),
                  (this.iframeMouseOverTimer = null))
                : (this.iframeMouseOverTimer = setTimeout(() => {
                    requestAnimationFrame(() => {
                      (document.body.style.paddingTop = '5px'), (this.elem.finalLogList.style.overflow = 'hidden');
                    });
                  }, 3e3)))),
            t != null &&
              t.isPopupActive &&
              !t.isPopupActive.newValue &&
              this.popupType === 'panel' &&
              e === 'local' &&
              (this.log('Stoping listening...'), window.close()),
            e === 'sync' &&
              chrome.storage.sync.get(this.settings, s => {
                this.settings = s;
              });
        });
      },
      windowResizeListener() {
        chrome.windows.getCurrent().then(t => {
          chrome.storage.local.set({ windowPopup: { height: t.height, width: t.width, left: t.left, top: t.top } });
        });
      },
      windowUnloadListener() {
        this.requestPopUpClose();
      },
      animationListener() {
        this.elem.interim.addEventListener(
          'animationend',
          t => {
            this.$nextTick().then(() => {
              t.currentTarget.style.animation = 'none';
            });
          },
          !1,
        ),
          this.elem.interim.addEventListener(
            'animationcancel',
            t => {
              this.$nextTick().then(() => {
                t.currentTarget.style.animation = 'none';
              });
            },
            !1,
          ),
          this.elem.finalLogList.addEventListener(
            'animationend',
            t => {
              this.$nextTick().then(() => {
                (t.currentTarget.style.animation = 'none'), (t.currentTarget.style.marginTop = 0);
              });
            },
            !1,
          ),
          this.elem.finalLogList.addEventListener(
            'animationcancel',
            t => {
              this.$nextTick().then(() => {
                (t.currentTarget.style.animation = 'none'), (t.currentTarget.style.marginTop = 0);
              });
            },
            !1,
          );
      },
      initPopup() {
        this.popupState.popupType ? (this.popupType = this.popupState.popupType) : (this.popupType = 'panel'),
          this.popupType === 'panel'
            ? (this.runServiceWorkerWatchdog(),
              chrome.windows.getCurrent().then(t => {
                chrome.storage.local.set({
                  isPopupActive: !0,
                  popupType: this.popupType,
                  popupId: t == null ? void 0 : t.id,
                });
              }))
            : this.popupType === 'window' && chrome.windows.onBoundsChanged.addListener(this.windowResizeListener);
      },
      initPopupDisplayOptions() {
        this.$nextTick().then(() => {
          (document.documentElement.style.fontSize = `${this.settings.popupFontSize}%`),
            this.popupType === 'iframe'
              ? (document.body.style.backgroundColor = `rgba(0,0,0, ${this.settings.popupFrameOpacity})`)
              : document.documentElement.classList.add('full');
        }),
          this.settings.isPopupOverlayMode && this.addOverlayMode();
      },
      runServiceWorkerWatchdog() {
        let t = chrome.runtime.connect({ name: 'keepAlive' });
        setInterval(() => {
          try {
            t.postMessage('ping');
          } catch {
            this.log('Reconnecting watchdog to Service Worker...'), (t = chrome.runtime.connect({ name: 'keepAlive' }));
          }
        }, 2e4);
      },
      addOverlayMode() {
        this.$nextTick().then(() => {
          document.documentElement.classList.add('overlay_mode');
          const t = document.body;
          (t.style.backgroundColor = this.settings.popupOverlayBgColor),
            (t.style.color = this.settings.popupOverlayTextColor),
            this.settings.isPopupOverlayTextShadow && t.classList.add('overlay_mode__body--text_shadow'),
            this.settings.isPopupOverlayTextOutline && t.classList.add('overlay_mode__body--outline_text_shadow');
        });
      },
      removeOverlayMode() {
        this.$nextTick().then(() => {
          document.documentElement.classList.remove('overlay_mode');
          const t = document.body;
          this.popupType === 'iframe'
            ? (t.style.backgroundColor = `rgba(0,0,0, ${this.settings.popupFrameOpacity})`)
            : (t.style.backgroundColor = null),
            (t.style.color = null),
            t.classList.remove('overlay_mode__body--text_shadow'),
            t.classList.remove('overlay_mode__body--outline_text_shadow');
        });
      },
      notificationOutputModule(t, e) {
        if (!this.settings.isOutputNotificationTranscript) return;
        const s = e === null ? t.finalTranslation : e.finalTranslation,
          a = t.finalTranslation;
        a !== s &&
          a &&
          chrome.notifications.create({
            type: 'basic',
            title: 'Translation',
            message: a,
            silent: !0,
            iconUrl: 'icon-128.png',
            requireInteraction: !1,
          });
      },
      isInterimTranscriptDublicate() {
        return this.state.interimTranscript === this.lastState.interimTranscript;
      },
      isPassMinTranslateInterval() {
        const t = Date.now();
        return this.lastTranslationTimestamp
          ? t > this.lastTranslationTimestamp + this.settings.expertTranslationDelayMs
            ? ((this.lastTranslationTimestamp = t), !0)
            : !1
          : ((this.lastTranslationTimestamp = t), !0);
      },
      async interimTranslateHandler(t) {
        const e = this.settings;
        t &&
          e.isOutputTranslatedText &&
          e.isOutputInterimTranslation &&
          (await this.translate(t, e.interimTranslateService).then(s => (this.state.interimTranslation = s)));
      },
      async finalTranslateHandler(t) {
        t &&
          (await this.translate(t, this.settings.finalTranslateService).then(e => {
            this.state.finalTranslation = e;
          }));
      },
      async translate(t, e) {
        const s = this.settings;
        return (e == null ? void 0 : e.abbr) === 'google_script'
          ? c.translate_gs(
              t,
              s.speechLang.translate_lang,
              s.translateLang[e.langCodeField],
              this.settings.googleScriptApiKey,
            )
          : e != null && e.isExternalApi
            ? c.translateProxyApi(
                t,
                s.speechLang.translate_lang,
                s.translateLang[e.langCodeField],
                s.isEnabledPersonalTranslationServer ? s.personalTranslationApiKey : s.sharedTranslationApiKey,
                s.isEnabledPersonalTranslationServer,
                e == null ? void 0 : e.abbr,
              )
            : c.translate_a(t, s.speechLang.translate_lang, s.translateLang[e.langCodeField]);
      },
      getTranslateLang(t) {
        return L.find(e => e.code === t.translate_lang);
      },
      startRecognition() {
        (this.recognition = new webkitSpeechRecognition()),
          (this.recognition.lang = this.settings.speechLang.speech_lang),
          (this.recognition.continuous = !0),
          (this.recognition.interimResults = !0),
          (this.recognition.onstart = this.onstart),
          (this.recognition.onend = this.onend),
          (this.recognition.onresult = this.onresult),
          (this.recognition.onerror = this.onerror),
          this.recognition.start();
      },
      stopRecognition() {
        this.recognition.stop();
      },
      onstart() {
        (this.state.status = 'listening'),
          this.log(`Listening for ${this.settings.speechLang.name} [${this.settings.speechLang.speech_lang}]`);
      },
      onerror(t) {
        try {
          const e = String(t.error);
          if (((this.state.status = 'error'), e === 'no-speech')) {
            this.state.status = 'warning';
            return;
          } else if (e === 'network') {
            (this.state.status = 'warning'), this.log('Network error', 'warning');
            return;
          } else e && this.log('Speech recognition error: ' + e, 'error');
          (e === 'not-allowed' || e === 'audio-capture') &&
            chrome.storage.local.set({ speechRecognitionErr: e }).then(() => {
              chrome.tabs.query({ active: !0, currentWindow: !0 }).then(s => {
                chrome.tabs.create({
                  url: chrome.runtime.getURL('options.html#instruction#grant-mic-permission'),
                  index: s[0].index + 1,
                });
              });
            }),
            this.stopRecognition(),
            this.requestPopUpClose();
        } catch (e) {
          console.error('[ST] ' + e), this.stopRecognition(), this.requestPopUpClose();
        }
      },
      onend() {
        if (this.state.status === 'error') {
          this.log('Ended with error'), (this.state.status = 'ended');
          return;
        }
        this.startRecognition();
      },
      async onresult(t) {
        let e = '',
          s = '';
        for (let a = t.resultIndex; a < t.results.length; ++a)
          t.results[a].isFinal ? (e += t.results[a][0].transcript) : (s += t.results[a][0].transcript);
        !e && s
          ? ((this.state.interimTranscript = this.settings.isHideInterimText ? '' : s),
            ((this.settings.isStreamingMode && s.length > this.settings.expertStreamingModeInterimCharsLimit) ||
              s.length > this.settings.expertInterimCharsLimit) &&
              t.currentTarget.stop(),
            !this.isInterimTranscriptDublicate() &&
              this.isPassMinTranslateInterval() &&
              !this.settings.isHideInterimText &&
              (await this.interimTranslateHandler(s), this.settings.isStreamingMode && this.eventStreamWidget()))
          : e &&
            ((this.state.finalTranscript = e),
            this.settings.isOutputConsoleOriginalText && this.log(e.trim(), '1'),
            this.settings.isOutputTranslatedText
              ? await this.finalTranslateHandler(e).then(() => {
                  this.settings.isOutputConsoleTranslatedText && this.log(this.state.finalTranslation.trim(), '2');
                })
              : (this.state.finalTranslation = e || this.state.finalTranscript),
            (this.state.interimTranslation = ''),
            (this.state.interimTranscript = ''),
            this.settings.isStreamingMode && this.eventStreamWidget(!0));
      },
      log(t, e) {
        (e = e ? ':' + e : ''), console.log(`[ST${e}] ${t}`);
      },
      initRecognition() {
        (this.state.status = 'starting'),
          (this.state.interimTranscript = ''),
          (this.state.interimTranslation = ''),
          (this.state.finalTranscript = ''),
          (this.state.finalTranslation = ''),
          this.log('Starting listening...');
      },
      eventStreamWidget(t = !1) {
        let e, s;
        this.settings.streamingServer.abbr === 'personal_server'
          ? ((e = this.settings.personalStreamingServerPrivateKey),
            (s = M(this.settings.streamingServer.pushURL, this.settings.personalStreamingServerPublicKey)))
          : ((e = this.settings.streamingPrivateKey), (s = this.settings.streamingServer.pushURL)),
          translate_a(new URL(e, s), this.settings, this.mapDataObj(t));
      },
      mapDataObj(t = !1) {
        let e = {
            data: { interim: { original: this.state.interimTranscript, translated: this.state.interimTranslation } },
          },
          s = { final: { original: this.state.finalTranscript, translated: this.state.finalTranslation } };
        return t && Object.assign(e.data, s), e;
      },
    },
    computed: {
      isInterimDoubleTextLine() {
        return (
          this.settings.isOutputInterimTranslation &&
          this.settings.isOutputOriginalText &&
          this.settings.isOutputTranslatedText
        );
      },
      isFinalDoubleTextLine() {
        return this.settings.isOutputOriginalText && this.settings.isOutputTranslatedText;
      },
      getMarginTopAnimShift() {
        const t = 16 * (this.settings.popupFontSize / 100);
        return this.isInterimDoubleTextLine
          ? this.elem.DOUBLE_LINE_MIN_HEIGHT * t
          : this.elem.SINGLE_LINE_MIN_HEIGHT * t;
      },
      getTextLineMinHeight() {
        return this.isInterimDoubleTextLine ? this.elem.DOUBLE_LINE_MIN_HEIGHT : this.elem.SINGLE_LINE_MIN_HEIGHT;
      },
      interimTextAlignCenter() {
        return this.settings.isPopupTextAlignCenter ? 'interim--text_center' : '';
      },
      finalTextAlignCenter() {
        return this.settings.isPopupTextAlignCenter ? 'final--text_center' : '';
      },
    },
    async created() {
      this.popupState.isPopupActive &&
        this.popupState.popupId &&
        this.popupState.popupType === 'panel' &&
        (await chrome.storage.local.set({ isPopupActive: !1 }), await new Promise(t => setTimeout(t, 300))),
        addEventListener('beforeunload', this.windowUnloadListener, !0),
        this.initPopup(),
        this.stateListener(),
        this.initRecognition();
    },
    mounted() {
      (this.elem.interim = this.$refs.interim),
        (this.elem.finalLogList = this.$refs['final-log__list']),
        this.animationListener(),
        this.initPopupDisplayOptions(),
        chrome.storage.local.set({ speechRecognitionErr: null }).then(() => {
          this.startRecognition();
        });
    },
  },
  A = ['state-status', 'final-translation-counter'],
  H = { class: 'text--interim' },
  N = { class: 'translation_text--interim' },
  U = { class: 'transcript_text--interim' },
  F = { class: 'final-log__list', ref: 'final-log__list' },
  B = { class: 'text--final' },
  z = { class: 'translation_text--final' },
  W = { class: 'transcript_text--final' };
function G(t, e, s, a, i, r) {
  return (
    h(),
    u(
      m,
      null,
      [
        this.settings.isStreamingMode && !this.settings.isHideStreamingModeWarning
          ? (h(),
            u(
              'div',
              {
                key: 0,
                class: o(this.popupType === 'window' ? 'streaming_mode_on--popup' : 'streaming_mode_on--iframe'),
              },
              ' STREAMING MODE IS ON ',
              2,
            ))
          : g('', !0),
        this.popupType === 'window'
          ? (h(),
            y(
              x,
              {
                key: 1,
                onClick: e[0] || (e[0] = l => r.openOptions()),
                size: '32',
                density: 'compact',
                variant: 'text',
                title: 'Settings',
                icon: i.ICON.mdiCog,
                color: '#757575',
                position: 'absolute',
                style: { fontSize: '16px', top: '8px', right: '8px' },
              },
              null,
              8,
              ['icon'],
            ))
          : g('', !0),
        n(
          'div',
          {
            class: o([
              'box',
              [i.settings.isPopupTextOutline && !i.settings.overlayMode ? 'box--outline_text_shadow' : ''],
            ]),
            'state-status': i.state.status,
            'final-translation-counter': this.finalStateItems.length,
          },
          [
            n(
              'div',
              {
                ref: 'interim',
                class: o(['interim', [i.settings.isPopupHideDividerLines ? '' : 'interim--border_bottom']]),
              },
              [
                n(
                  'div',
                  { class: 'interim__grid', style: S({ minHeight: r.getTextLineMinHeight + 'rem' }) },
                  [
                    n(
                      'div',
                      {
                        class: o([
                          'interim__text',
                          [
                            i.settings.isOutputOriginalText ? i.sourceTranslateLang.font_class_css : '',
                            i.settings.isOutputTranslatedText && i.settings.isOutputInterimTranslation
                              ? i.settings.translateLang.font_class_css
                              : '',
                            r.isInterimDoubleTextLine ? 'd-none' : '',
                            r.finalTextAlignCenter,
                          ],
                        ]),
                      },
                      [
                        n(
                          'span',
                          H,
                          p(
                            (i.settings.isOutputOriginalText ? i.state.interimTranscript : '') +
                              (i.settings.isOutputTranslatedText ? i.state.interimTranslation : ''),
                          ),
                          1,
                        ),
                      ],
                      2,
                    ),
                    n(
                      'div',
                      {
                        class: o([
                          'interim__translation',
                          [
                            i.settings.translateLang.font_class_css,
                            r.finalTextAlignCenter,
                            r.isInterimDoubleTextLine ? '' : 'd-none',
                          ],
                        ]),
                      },
                      [n('span', N, p(i.state.interimTranslation), 1)],
                      2,
                    ),
                    n(
                      'div',
                      {
                        class: o([
                          'interim__transcript',
                          [
                            i.sourceTranslateLang.font_class_css,
                            r.finalTextAlignCenter,
                            r.isInterimDoubleTextLine ? '' : 'd-none',
                          ],
                        ]),
                      },
                      [n('span', U, p(i.state.interimTranscript), 1)],
                      2,
                    ),
                  ],
                  4,
                ),
              ],
              2,
            ),
            n(
              'ol',
              F,
              [
                (h(!0),
                u(
                  m,
                  null,
                  O(
                    i.finalStateItems,
                    (l, d) => (
                      h(),
                      u(
                        'li',
                        {
                          key: `FT_${d}`,
                          class: o(['final', [i.settings.isPopupHideDividerLines ? '' : 'final--border_bottom']]),
                        },
                        [
                          n(
                            'div',
                            { class: o(['final__text', [l.singleLineTextClass, r.finalTextAlignCenter]]) },
                            [n('span', B, p(l.finalTranslation), 1)],
                            2,
                          ),
                          n(
                            'div',
                            {
                              class: o([
                                'final__translation',
                                [l.langCssTranslated, l.doubleLineDisplayClass, r.finalTextAlignCenter],
                              ]),
                            },
                            [n('span', z, p(l.finalTranslation), 1)],
                            2,
                          ),
                          n(
                            'div',
                            {
                              class: o([
                                'final__transcript',
                                [l.langCssOriginal, l.doubleLineDisplayClass, r.finalTextAlignCenter],
                              ]),
                            },
                            [n('span', W, p(l.finalTranscript), 1)],
                            2,
                          ),
                        ],
                        2,
                      )
                    ),
                  ),
                  128,
                )),
              ],
              512,
            ),
          ],
          10,
          A,
        ),
      ],
      64,
    )
  );
}
const V = T(R, [['render', G]]),
  q = b({
    theme: { defaultTheme: 'dark', themes: { dark: w, light: P } },
    icons: { defaultSet: 'mdi', aliases: E, sets: { mdi: k } },
  });
chrome.storage.sync.get(v, t => {
  chrome.storage.local.get(I, e => {
    C(V, { _settings: t, _popupState: e }).use(q).mount('#popup');
  });
});
