import React, { useEffect } from 'react';

declare global {
    interface Window {
        SpeechRecognition: typeof SpeechRecognition;
        webkitSpeechRecognition: typeof webkitSpeechRecognition;
    }
}

const Popup: React.FC = () => {
    useEffect(() => {
        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        debugger;
        recognition.onstart = () => {
            console.log('Voice recognition started. Try speqưerweqrqweraking into the microphone.');
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            console.log('You said: ', transcript);
        };

        recognition.start();
    }, []);

    return (
        <div>
            <h1>Speech Recognition Popup</h1>
        </div>
    );
};

export default Popup; 
