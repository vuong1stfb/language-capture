import React, { useEffect, useState } from 'react';
import { b as cccccc } from '@src/reference-src/folder1/asset/event-stream-738ec9a0.js';

const Popup = ({ _settings, _popupState }) => {
  const [settings, setSettings] = useState(_settings);
  const [sourceTranslateLang, setSourceTranslateLang] = useState(getTranslateLang(settings.speechLang));

  const translate = async (text, service) => {
    const s = settings; // Sử dụng settings từ state

    if (service?.abbr === 'google_script') {
      return await cccccc.translate_gs(
        text,
        s.speechLang.translate_lang,
        s.translateLang[service.langCodeField],
        s.googleScriptApiKey,
      );
    } else if (service?.isExternalApi) {
      return await cccccc.translateProxyApi(
        text,
        s.speechLang.translate_lang,
        s.translateLang[service.langCodeField],
        s.isEnabledPersonalTranslationServer ? s.personalTranslationApiKey : s.sharedTranslationApiKey,
        s.isEnabledPersonalTranslationServer,
        service?.abbr,
      );
    } else {
      return await cccccc.translate_a(text, s.speechLang.translate_lang, s.translateLang[service.langCodeField]);
    }
  };

  const getTranslateLang = lang => {
    // Logic để lấy ngôn ngữ dịch
    return settings.languages.find(e => e.code === lang.translate_lang);
  };

  return <div className="popup">{/* Render nội dung của popup */}</div>;
};

export default Popup;
