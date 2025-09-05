
const speechRecognitionCheckbox = document.getElementById('SpeechRecognition');

function executeTasks(command) {
    const isSystemStarted = startBtn.innerText.includes("Stop");
    const isPoseDetectionStarted = poseDetectionBtn.innerText.includes("Stop");
    const isHumanDetectionStarted = peopleDetectionBtn.innerText.includes("Stop");
    const isEmotionDetectionStarted = emotionDetectionBtn.innerText.includes("Stop");
    const isDancingModeOn = danceBtn.innerText.includes("running");
    const isGameStarted = playRockPaperGameBtn.innerText.includes("Game started") || playPongGameBtn.innerText.includes("Game started");
    switch (command.toLowerCase()) {
        case 'start system':
        case 'star system':
            if (!isSystemStarted) startBtn.click();
            break;
        case 'stop system':
        case 'turn off system':
        case 'turn off the system':
            if (isSystemStarted) startBtn.click();
            break;
        case 'detect people':
        case 'human detect':
        case 'people detect':
        case 'detecting people':
        case 'detection people':
            if (!isHumanDetectionStarted) peopleDetectionBtn.click();
            break;
        case 'pose detection':
        case 'see how i move':
        case 'move detection':
        case 'detect move':
        case 'detect pose':
            if (!isPoseDetectionStarted) poseDetectionBtn.click();
            break;
        case 'feelings':
        case 'read my feel':
        case 'emotion':
            if (!isEmotionDetectionStarted) emotionDetectionBtn.click();
            break;
        case 'start dance':
        case 'start dancing':
        case 'dance for':
            if (!isDancingModeOn) danceBtn.click();
            break;
        case 'stop danc':
            if (isDancingModeOn) danceBtn.click();
            break;  
        case 'stop detect':
        case 'turn off detect':
            stopRunningActions();
            break;
        case 'emergency':
        case 'help help':    
        case 'please help':  
            emergencyBtn.click();
            break;
        case 'start gam':
        case 'play gam':
        case 'playing game':
        case 'play again':
        case 'start again':    
            if (!isGameStarted) playRockPaperGameBtn.click();
            break; 
        case 'pong':
        case 'punk':
            if (!isGameStarted) playPongGameBtn.click();
            break; 

        case `hi ${ROBOT_NAME}`:
        case `hey ${ROBOT_NAME}`:
        case `hello ${ROBOT_NAME}`:
            sendMessage('heyMode');
            speak(MESSAGES.HI);
            break;
        case 'you speak':
            speak(MESSAGES.LANGUAGES_SPOKEN);
            break; 
        case 'doing great':
        case 'i am good':
        case 'doing well':
        case 'i am great':
        case 'i am fine':
            speak(MESSAGES.HAPPY_TO_HEAR);
            break;    
        case 'what is your name':
        case 'who are you':
            speak(MESSAGES.SAYING_ROBOT_NAME);
            break;   
        case 'how are you':
        case 'your day':
        case 'do you do':
        case 'how is it going':
        case 'how is going':
            speak(MESSAGES.GREETINGS_ANSWER);
            break;
        case `thanks ${ROBOT_NAME}`:
        case `thank you ${ROBOT_NAME}`:
            speak(MESSAGES.THANKS_RESPONSE);
            break;    
        case 'who made you':
        case 'who created you':
        case 'who built you':
        case 'who is your creator':
        case 'who designed you':
        case 'who developed you':
            speak(MESSAGES.CREATOR);
            break; 
        case 'where are you from':
        case 'where you from':
        case 'where were you made':
        case 'where were you created':
        case 'where were you built':
        case 'is your origin':
        case 'which country were you developed':
            speak(MESSAGES.ORIGIN);
            break; 
        case 'you are stupid':
                speak(MESSAGES.ANGRY_ROBOT);
                break; 
        case 'f*** you':
                speak(MESSAGES.INSULT_ANSWER);
                break;            
        case 'stop speech recognition':
        case 'turn off speech':
        case 'turn off the speech':
            speechRecognitionCheckbox.click();
            break; 
        case 'tv mode':
        case 'mode tv':
            tvModeBtn.click();
            break;     
        default:
            console.log(`Command "${command}" not recognized.`);
            break;
    }
    
}

let lastCommand = ''
let lastAiCommand=''
let recognition
let startListening = false;
let textInCommands = false;

function startContinuousRecognition() {
    recognition = new (window.speechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = true;
    
    recognition.onresult = (event) => {
        if(!aiTaskRunning){
          const results = Array.from(event.results);
          let interimResult = results.filter(result => !result.isFinal).map(result => result[0].transcript.toLowerCase().trim().replace("  ", " ")).join(' ');
          const finalResults = results.filter(result => result.isFinal);
          let finalResult = finalResults.length > 0 ? finalResults[finalResults.length - 1][0].transcript.toLowerCase().trim().replace("  ", " ") : '';
          interimResult = interimResult.trim()
                                            .replaceAll("  ", " ")
                                            .replaceAll("you're", "you are")
                                            .replaceAll("I'm", "I am")
                                            .replaceAll("what's", "what is")
                                            .replaceAll("how's", "how is");

        if(!speakRunning){
            transcriptHomePage.classList.remove('robotAnswer');
            transcriptHomePage.innerText = interimResult;
            sendMessage({transcript:interimResult}, false);
        }
        //   console.log(`Interim transcript: ${interimResult}`);
        //   console.log(`Final transcript: ${finalResult}`);
        if (interimResult) processTranscript(interimResult)
        finalResult = finalResult.replaceAll(ROBOT_NAME, '');

        if (!aiTaskRunning && !speakRunning && startListening && finalResult.length > 18 && !textInCommands && finalResult != lastAiCommand) {
            lastAiCommand = finalResult;
            useAiToGetAnswer(finalResult);
        }
      
        if (interimResult.includes(ROBOT_NAME) && !textInCommands && !startListening && !speakRunning && !aiTaskRunning) {
          speak(MESSAGES.ROBOT_LISTENING, () => { startListening = true; });
        }
      };
}
     
    recognition.onerror = (event) => { console.log(`Recognition error: ${event.error}`); };
    recognition.onend = () => {
        console.log('Speech recognition service disconnected');
        if (speechRecognitionCheckbox.checked) {
            setTimeout(() => {
              recognition.start(); // Restart recognition with a slight delay to prevent immediate end/start loop
            }, 150);
          }
    };

    recognition.start();
}

function stopSpeechRecognition() {
    if (recognition) {
      console.log('Stopping speech recognition');
      recognition.onend = null; // Temporarily remove the onend handler to avoid auto-restart
      recognition.stop();
      recognition = null;
      console.log('Speech recognition stopped');
    }
}

if(speechRecognitionCheckbox.checked) startContinuousRecognition()
speechRecognitionCheckbox.addEventListener('change', (event) => {
      if (event.target.checked) {
        speak(MESSAGES.START_SPEECH); 
        startContinuousRecognition()
      } 
      else {
        stopSpeechRecognition()
        speak(MESSAGES.STOP_SPEECH); 
      }
});

function processTranscript(transcript) {
  textInCommands = false;
  for (let command of commandsList) {
      if (transcript.includes(command) ) {
          startListening = false;
          textInCommands = true;
          if (lastCommand != command || command.includes('stop detect')) {
              console.log(`Command sent: ${command}`);
              executeTasks(command);
              lastCommand = command;
              break;
          }
      }
  }
  }
