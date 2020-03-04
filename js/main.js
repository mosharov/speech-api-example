'use strict';

const browserLanguage = navigator.language || navigator.userLanguage;

//DOM elements for synthesis
const synthesisDescription = document.querySelector('#synthesisDescription');
const synthesisForm = document.querySelector('#synthesisForm');
const synthesisText = document.querySelector('#synthesisText');
const synthesisVoicesList = document.querySelector('#synthesisVoicesList');
const synthesisPlayButton = document.querySelector('#synthesisPlayButton');

//DOM elements for recognition
const recognitionDescription  = document.querySelector('#recognitionDescription');
const recognitionLanguage = document.querySelector('#recognitionLanguage');
const recognitionPlayButton = document.querySelector('#recognitionPlayButton');
const recognitionTextResult = document.querySelector('#recognitionResult');

//text for descriptions
if (browserLanguage === 'ru-RU') {
    synthesisDescription.textContent = 'Синтез речи. Введите текст, выберите "актера" и нажмите play';
    recognitionDescription.textContent = 'Распознавание речи. Нажмите на иконку микрофона и скажите что-нибудь';
    recognitionLanguage.textContent = 'Язык распознавания: ' + browserLanguage;
} else {
    synthesisDescription.textContent = 'Voice synthesis. Type some text, choose voice and press play button';
    recognitionDescription.textContent = 'Speech recognition. Press the button and say something';
    recognitionLanguage.textContent = 'Recognition language: ' + browserLanguage;
}

// ------ SPEECH SYNTHESIS ------
let voices = [];

function populateVoiceList() {

    let defaultIndex = 0;

    voices = speechSynthesis.getVoices();

    for (let i = 0; i < voices.length; i++) {

        //select voice for default browser language
        if (voices[i].lang === browserLanguage) {
            defaultIndex = i;
        }

        const option = document.createElement('option');
        option.textContent = voices[i].name + ' (' + voices[i].lang + ')';
        synthesisVoicesList.appendChild(option);

    }

    synthesisVoicesList.selectedIndex = defaultIndex;

}

if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = populateVoiceList;
}

function speak(textToSpeech) {

    if (speechSynthesis.speaking) {
        synthesisPlayButton.textContent = 'Play';
        speechSynthesis.cancel();
    } else if (textToSpeech) {

        synthesisPlayButton.textContent = 'Stop';

        const utterThis = new SpeechSynthesisUtterance(textToSpeech);

        utterThis.voice = voices[synthesisVoicesList.selectedIndex];
        utterThis.onend = function(event) {
            console.log('SpeechSynthesisUtterance.onend');
            synthesisPlayButton.textContent = 'Play';
        };
        utterThis.onerror = function(event) {
            console.error('SpeechSynthesisUtterance.onerror');
            synthesisPlayButton.textContent = 'Play';
        };

        speechSynthesis.speak(utterThis);

    }

}

synthesisForm.onsubmit = function(event) {

    event.preventDefault();
    speak(synthesisText.value);
    synthesisText.blur();

};

synthesisVoicesList.onchange = function() {
    speak(synthesisText.value);
};
// ------ /SPEECH SYNTHESIS ------

// ------ SPEECH RECOGNITION ------
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const SpeechRecognitionEvent = window.SpeechRecognitionEvent || window.webkitSpeechRecognitionEvent;
const recognition = new SpeechRecognition();
let recognitionStarted = false;
let recognitionResult = '';
let colors = {};

//populate colors
if (browserLanguage === 'ru-RU') {

    colors['красный'] = 'red';
    colors['оранжевый'] = 'orange';
    colors['желтый'] = 'yellow';
    colors['жёлтый'] = 'yellow';
    colors['зеленый'] = 'green';
    colors['зелёный'] = 'green';
    colors['синий'] = 'blue';

} else {

    colors['red'] = 'red';
    colors['orange'] = 'orange';
    colors['yellow'] = 'yellow';
    colors['green'] = 'green';
    colors['blue'] = 'blue';

}

recognition.lang = browserLanguage;
recognition.continuous = true;
recognition.interimResults = true;
recognition.maxAlternatives = 5;

recognitionPlayButton.onclick = function() {

    if (recognitionStarted) {
        recognition.stop();
        recognitionStarted = false;
    } else {
        recognition.start();
        recognitionStarted = true;
    }

};

recognition.onresult = function(event) {

    let recognitionTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; i++) {

        let transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {

            const trimmedTranscript = transcript.trim();
            const transcriptArray = trimmedTranscript.split(' ');

            transcriptArray.forEach(transcript => {
                const lowerCaseTranscript = transcript.toLocaleLowerCase();

                if ( colors[lowerCaseTranscript] ) {
                    recognitionResult += ` <span class="transcript" style="background-color: ${colors[lowerCaseTranscript]};">` + transcript + `</span>`;
                } else {
                    recognitionResult += ' ' + transcript;
                }

            });

        } else {
            recognitionTranscript += transcript;
        }

    }

    recognitionTextResult.innerHTML = recognitionResult + '<i style="color:#999999;">' + recognitionTranscript + '</i>';
};

recognition.onspeechend = function() {
    recognition.stop();
};

recognition.onerror = function(event) {
    recognition.stop();
    alert(`Error occurred in recognition: ${event.error}`);
};

recognition.onstart = function(event) {
    recognitionPlayButton.textContent = "Stop";
    recognitionPlayButton.classList.add("recognitionPlayButton--active");
};

recognition.onend = function(event) {
    recognitionPlayButton.textContent = "Start";
    recognitionPlayButton.classList.remove("recognitionPlayButton--active");
};
// ------ /SPEECH RECOGNITION ------
