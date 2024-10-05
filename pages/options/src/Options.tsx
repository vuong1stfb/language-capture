import React, { useEffect, useState } from 'react';

type Caption = { text: string; endedAt: Date };


const Options: React.FC = () => {
    const [listCaptions, setListCaptions] = useState<Caption[]>([]);
    useEffect(() => {
        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.continuous = true; // Thêm dòng này để nhận diện liên tục
        recognition.onstart = () => {
            console.log('Voice recognition started. Try speaking into the microphone.');
        };
        recognition.onresult = (event: SpeechRecognitionEvent) => {
            let finalTranscript = '';
        
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
        
                if (event.results[i].isFinal) {
                    finalTranscript += transcript; 
                    const row_data: Caption = { text: transcript, endedAt: new Date() }; // Define the type for row_data
                    setListCaptions(prevCaptions => [...prevCaptions, row_data]);
                }
            }
            console.log(finalTranscript); 
        }

        recognition.start();
    }, []);

    return (
        <div>
            <h1>Speech Recognition Popup</h1>
            <ul>
                {listCaptions.map((caption, index) => (
                    <li key={index}>{caption.text}</li>
                ))}
            </ul>
        </div>
    );
};

export default Options;
