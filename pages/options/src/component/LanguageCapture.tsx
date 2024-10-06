import type { defaultSettings } from '@src/data/DefaultSettings';
import React, { useEffect, useRef, useState } from 'react';
import * as serviceT from '@extension/shared/lib/utils/common';
type State = {
  status: string;
  interimTranscript: string;
  interimTranslation: string;
  finalTranscript: string;
  finalTranslation: string;
};
interface Props {
  settings: typeof defaultSettings;
}
const initialState: State = {
  status: 'idle',
  interimTranscript: '',
  interimTranslation: '',
  finalTranscript: '',
  finalTranslation: '',
};
const LanguageCapture: React.FC<Props> = props => {
  const [state, setState] = useState<State>(initialState);
  const [stateInterimTranslation, setStateInterimTranslation] = useState<State>(initialState);
  const [stateFinalTranslation, setStateFinalTranslation] = useState<State>(initialState);
  const [finalStateItems, setFinalStateItems] = useState<State[]>([]);
  const { settings: defaultSettings } = props;

  const lastState = useRef();
  const [recognition, setRecognition] = useState(null);
  const lastTranslationTimestamp = useRef(null);
  const isInterimTranscriptDublicate = () =>
    state.interimTranscript === lastState.current.interimTranscript ? true : false;
  const translate = async (_text, _defaultSettings) => {
    if (_defaultSettings == null || _defaultSettings.abbr !== 'google_script') {
      if (_defaultSettings != null && _defaultSettings.isExternalApi) {
        return serviceT.translateProxyApi(
          _text,
          _defaultSettings.speechLang.translate_lang,
          _defaultSettings.translateLang[_defaultSettings.langCodeField],
          _defaultSettings.isEnabledPersonalTranslationServer
            ? _defaultSettings.personalTranslationApiKey
            : _defaultSettings.sharedTranslationApiKey,
          _defaultSettings.isEnabledPersonalTranslationServer,
          _defaultSettings == null ? void 0 : _defaultSettings.abbr,
        );
      } else {
        return serviceT.translate_a(
          _text,
          _defaultSettings.speechLang.translate_lang,
          _defaultSettings.translateLang[_defaultSettings.langCodeField],
        );
      }
    } else {
      return serviceT.translate_gs(
        _text,
        _defaultSettings.speechLang.translate_lang,
        _defaultSettings.translateLang[_defaultSettings.langCodeField],
        _defaultSettings.googleScriptApiKey,
      );
    }
  };
  const isPassMinTranslateInterval = () => {
    const t = Date.now();
    if (lastTranslationTimestamp.current) {
      if (t > lastTranslationTimestamp.current + defaultSettings.expertTranslationDelayMs) {
        lastTranslationTimestamp.current = t; // Cast t to number
        return true;
      } else {
        return false;
      }
    } else {
      lastTranslationTimestamp.current = t;
      return true;
    }
  };
  const stateListener = () => {
    // Logic lắng nghe trạng thái
  };

  const interimTranslateHandler = async t => {
    const e = defaultSettings;

    if (t) {
      if (e.isOutputTranslatedText && e.isOutputInterimTranslation) {
        const result = await translate(t, defaultSettings);
        setState(prevState => ({
          ...prevState,
          interimTranslation: result,
        }));
        setStateInterimTranslation(prevState => ({
          ...prevState,
          interimTranslation: result,
        }));
      }
    }
  };
  const finalTranslateHandler = async t => {
    if (t) {
      const result = await translate(t, defaultSettings);
      const _state = { ...state };
      console.log('dime', _state);
      setState(prevState => {
        setStateFinalTranslation(() => ({
          ...prevState,
          finalTranslation: result,
        }));
        setFinalStateItems(preFinalStateItems => [
          ...preFinalStateItems,
          {
            ...prevState,
            finalTranslation: result,
          },
        ]);
        return {
          ...prevState,
          finalTranslation: result,
        };
      });
    }
  };
  const onStart = () => {
    setState(prevState => ({ ...prevState, status: 'listening' }));
    console.log(`Listening for ${defaultSettings.speechLang.name}`);
  };

  const onResult = async (event: SpeechRecognitionEvent) => {
    let _finalTranscript = '',
      _interimTranscript = '';

    for (let a = event.resultIndex; a < event.results.length; ++a)
      event.results[a].isFinal
        ? (_finalTranscript += event.results[a][0].transcript)
        : (_interimTranscript += event.results[a][0].transcript);
    if (!_finalTranscript && _interimTranscript) {
      setState(prevState => ({
        ...prevState,
        interimTranscript: defaultSettings.isHideInterimText ? '' : _interimTranscript,
      }));
      if (
        (defaultSettings.isStreamingMode &&
          _interimTranscript.length > defaultSettings.expertStreamingModeInterimCharsLimit) ||
        _interimTranscript.length > defaultSettings.expertInterimCharsLimit
      ) {
        event.currentTarget.stop();
      }
    } else if (_finalTranscript) {
      setState(prevState => ({
        ...prevState,
        finalTranscript: _finalTranscript,
        interimTranslation: '',
        interimTranscript: '',
      }));

      if (defaultSettings.isOutputTranslatedText) {
        await this.finalTranslateHandler(_finalTranscript).then(() => {
          defaultSettings.isOutputConsoleTranslatedText && console.log(state.finalTranslation.trim(), '2');
        });
      } else {
        setState(prevState => ({
          ...prevState,
          finalTranslation: _finalTranscript || prevState.finalTranscript,
        }));
      }
    }
  };
  const onReult2 = (event: SpeechRecognitionEvent) => {
    let _finalTranscript = '',
      _interimTranscript = '',
      _state = { ...state };

    for (let a = event.resultIndex; a < event.results.length; ++a)
      event.results[a].isFinal
        ? (_finalTranscript += event.results[a][0].transcript)
        : (_interimTranscript += event.results[a][0].transcript);
    if (!_finalTranscript && _interimTranscript) {
      _state.interimTranscript = defaultSettings.isHideInterimText ? '' : _interimTranscript;
      if (
        (defaultSettings.isStreamingMode &&
          _interimTranscript.length > defaultSettings.expertStreamingModeInterimCharsLimit) ||
        _interimTranscript.length > defaultSettings.expertInterimCharsLimit
      ) {
        event.currentTarget.stop();
      }
      if (!isInterimTranscriptDublicate() && isPassMinTranslateInterval() && !defaultSettings.isHideInterimText) {
        interimTranslateHandler(_interimTranscript);
        if (defaultSettings.isStreamingMode) {
          // this.eventStreamWidget();
        }
      }
    } else if (_finalTranscript) {
      _state.finalTranscript = _finalTranscript;
      if (defaultSettings.isOutputConsoleOriginalText) {
        console.log(_finalTranscript.trim(), '1');
      }
      if (defaultSettings.isOutputTranslatedText) {
        finalTranslateHandler(_finalTranscript);
      } else {
        _state.finalTranslation = _finalTranscript || _state.finalTranscript;
      }
      _state.interimTranslation = '';
      _state.interimTranscript = '';
      if (defaultSettings.isStreamingMode) {
        // this.eventStreamWidget(true);
      }
    }
    setState(_state);
    // console.log(state);
  };
  // console.log(state);
  const onError = (event: SpeechRecognitionError) => {
    console.error('Speech recognition error: ', event.error);
    setState(prevState => ({ ...prevState, status: 'error' }));
  };
  const stopRecognition = () => {
    recognition.stop();
  };

  const initRecognition = () => {
    const newRecognition = new window.webkitSpeechRecognition();
    newRecognition.lang = 'en-US';
    newRecognition.continuous = true;
    newRecognition.interimResults = true;
    newRecognition.onstart = onStart;
    newRecognition.onend = onEnd;
    newRecognition.onresult = onReult2;
    newRecognition.onerror = onError;
    newRecognition.start();
    setRecognition(newRecognition);
  };

  const onEnd = () => {
    if (state.status === 'error') {
      console.log('Ended with error');
      setState(prevState => ({ ...prevState, status: 'ended' }));
      return;
    }
    initRecognition();
  };

  useEffect(() => {
    lastState.current = state;
  }, [state]);
  useEffect(() => {
    stateListener();
    initRecognition();
  }, []);
  console.log(state);
  return (
    <div>
      <h1>Language Capture</h1>
      <div>
        <p>Status: {state.status}</p>
        <p>Interim Transcript: {state.interimTranscript}</p>
        <p>Interim Translation: {stateInterimTranslation.interimTranslation}</p>
        <br />
        <p>Final Transcript: {stateFinalTranslation.finalTranscript}</p>
        <p>Final Translation: {stateFinalTranslation.finalTranslation}</p>
        <br />
        <ul>
          {finalStateItems.map((item, index) => (
            <>
              <li key={index}>{item.finalTranscript}</li>
              <li key={index}>{item.finalTranslation}</li>
            </>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default LanguageCapture;
