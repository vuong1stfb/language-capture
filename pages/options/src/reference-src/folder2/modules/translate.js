const IS_DEBUGGING = false;

function log(str, ...args) {
  if (IS_DEBUGGING) console.log(str, args);
}

export async function checkGoogleTranslate() {
  const sourceLanguage = 'en';
  const targetLanguage = 'ru';
  const text = `She ran as fast as she could, but the zombies were closing in. 
        She reached the door, but it was locked. She looked for a key, but there was none. 
        She heard a growl behind her. She turned around and saw a familiar face. 
        It was her husband, but he was not himself. He was one of them.`;

  log('[ST:API:req] translate_a:', sourceLanguage, targetLanguage, text);
  const url =
    'https://translate.googleapis.com/translate_a/single' +
    '?client=gtx' +
    '&dt=t' +
    '&sl=' +
    encodeURIComponent(sourceLanguage) +
    '&tl=' +
    encodeURIComponent(targetLanguage) +
    '&q=' +
    encodeURIComponent(text);

  try {
    let res = await fetch(url);
    let data = await res.json();
    if (res.ok && data) {
      if (data?.[0]?.[0]?.[0] !== undefined) {
        let result = '';
        data[0].forEach(obj => {
          if (obj[0]) {
            result += obj[0];
          }
        });
        log('[ST:API:res] translate_a:', result);

        return true;
      }
    }
    console.error('[ST:API:error] ' + JSON.stringify(data));
  } catch (error) {
    console.error('[ST:API:error] ' + error);
    return false;
  }
  return false;
}

export async function detectLang(text) {
  log('[API:req] detectLang:', text);
  const url =
    'https://translate.googleapis.com/translate_a/single' +
    '?client=gtx' +
    '&dj=1' +
    '&sl=auto' +
    '&q=' +
    encodeURIComponent(text);
  try {
    let res = await fetch(url);
    let data = await res.json();

    if (data !== undefined) {
      let result = data.src;

      log('[ST:API:res] detectLang:', result);

      return result;
    }

    console.error('[ST:API:error] ' + JSON.stringify(data));
  } catch (error) {
    console.error('[ST:API:error] ' + error);
  }
}

export async function translate_a(text, sourceLanguage, targetLanguage) {
  log('[ST:API:req] translate_a:', sourceLanguage, targetLanguage, text);
  const url =
    'https://translate.googleapis.com/translate_a/single' +
    '?client=gtx' +
    '&dt=t' +
    '&sl=' +
    encodeURIComponent(sourceLanguage) +
    '&tl=' +
    encodeURIComponent(targetLanguage) +
    '&q=' +
    encodeURIComponent(text);

  try {
    let res = await fetch(url);
    let data = await res.json();
    if (res.ok && data) {
      if (data?.[0]?.[0]?.[0] !== undefined) {
        let result = '';
        data[0].forEach(obj => {
          if (obj[0]) {
            result += obj[0];
          }
        });

        log('[ST:API:res] translate_a:', result);

        return result;
      }
    }

    console.error('[ST:API:error] ' + JSON.stringify(data));
  } catch (error) {
    console.error('[ST:API:error] ' + error);
  }
}

export async function translate_gs(text, sourceLanguage, targetLanguage, scriptApiKey) {
  log('[API:req] translate_gs:', sourceLanguage, targetLanguage, scriptApiKey, text);
  const url =
    'https://script.google.com/macros/s/' +
    scriptApiKey +
    '/exec' +
    '?source=' +
    encodeURIComponent(sourceLanguage) +
    '&target=' +
    encodeURIComponent(targetLanguage) +
    '&text=' +
    encodeURIComponent(text);
  try {
    let res = await fetch(url);
    let result = await res.text();

    if (res.ok && result) {
      log('[ST:API:res] translate_gs:', result);

      return result;
    }
  } catch (error) {
    console.error('[ST:API:error] ' + error);
  }
}

export async function translateProxyApi(
  text,
  sourceLanguage,
  targetLanguage,
  apiKey,
  isPersonalServer = false,
  translator = 'google',
) {
  let url;
  log('[API:req] translateProxyApi:', sourceLanguage, targetLanguage, translator, apiKey, isPersonalServer, text);

  apiKey = apiKey.toLowerCase().trim();

  if (isPersonalServer) {
    const personalURL = apiKey.slice(0, 6);
    url = new URL(`https://st-api-${personalURL}.kappaflow.dev/translate/`);
  } else {
    url = new URL(`https://st-api.kappaflow.dev/translate/`);
  }
  const body = {
    api_key: apiKey,
    query_text: text,
    translator: translator,
    from_language: sourceLanguage,
    to_language: targetLanguage,
  };
  log(`body: ${JSON.stringify(body)}`);
  const req = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  };
  try {
    let res = await fetch(url, req);
    let data = await res.json();

    if (data?.['is_success']) {
      const result = data['translated_text'];
      log('[ST:API:res] translateProxyApi:', result);
      return result;
    }

    console.error('[ST:API:error] ' + JSON.stringify(data));
  } catch (error) {
    console.error('[ST:API:error] ' + error);
  }
}

export default { detectLang, translate_a, translate_gs, translateProxyApi };
