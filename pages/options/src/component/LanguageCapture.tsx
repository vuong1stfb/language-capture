import React, { useEffect, useState } from 'react';

interface LanguageCaptureProps {
  _settings: {
    speechLang: {
      name: string;
    };
  };
}
type State = {
  status: string;
  interimTranscript: string;
  finalTranscript: string;
  finalTranslation: string;
};

const LanguageCapture: React.FC<LanguageCaptureProps> = props => {
  const [state, setState] = useState<State>({
    status: 'idle',
    interimTranscript: '',
    finalTranscript: '',
    finalTranslation: '',
  });

  const [finalStateItems, setFinalStateItems] = useState([]);
  const [popupType, setPopupType] = useState(null);
  const [recognition, setRecognition] = useState(null);
  const stateListener = () => {
    // Logic lắng nghe trạng thái
  };

  const onStart = () => {
    setState(prevState => ({ ...prevState, status: 'listening' }));
    console.log(`Listening for ${props._settings.speechLang.name}`);
  };

  const onResult = (event: SpeechRecognitionEvent) => {
    let finalTranscript = '';
    let interimTranscript = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript;
      } else {
        interimTranscript += event.results[i][0].transcript;
      }
    }
    setState(prevState => ({
      ...prevState,
      interimTranscript,
      finalTranscript,
    }));
  };
  const onError = (event: SpeechRecognitionError) => {
    console.error('Speech recognition error: ', event.error);
    setState(prevState => ({ ...prevState, status: 'error' }));
  };
  const stopRecognition = () => {
    recognition.stop();
  };
  const initRecognition = () => {
    const newRecognition = new (window.SpeechRecognition || (window as any).webkitSpeechRecognition)();
    newRecognition.lang = 'en-US';
    newRecognition.continuous = true;
    newRecognition.interimResults = true;
    newRecognition.onstart = onStart;
    newRecognition.onend = onEnd;
    newRecognition.onresult = onResult;
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
    stateListener();
    initRecognition();
  }, []);

  return (
    <div>
      <h1>Language Capture</h1>
      <div>
        <p>Status: {state.status}</p>
        <p>Interim Transcript: {state.interimTranscript}</p>
        <p>Final Transcript: {state.finalTranscript}</p>
        {/* Render các finalStateItems */}
        <ul>
          {finalStateItems.map((item, index) => (
            <li key={index}>{item.finalTranslation}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default LanguageCapture;
