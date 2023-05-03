const meditationStepsDefault = [
    { duration: 300, emoji: '🧘‍♀️', text: 'Begin with deep breathing. Inhale through your nose and exhale through your mouth, focusing on your breath.' },
    { duration: 300, emoji: '🙇‍♂️', text: 'Perform a body scan. Starting from the top of your head, mentally scan your body down to your toes, releasing tension as you go.' },
    { duration: 600, emoji: '🧘‍♂️', text: 'Practice mindfulness meditation. Focus on your breath and count each inhale and exhale up to 10, then start over.' },
    { duration: 300, emoji: '💖', text: 'Start loving-kindness meditation. Silently repeat phrases of loving-kindness for yourself and others.' },
    { duration: 180, emoji: '🙏', text: 'Reflect on gratitude. Think of a few things you are grateful for today.' },
    { duration: 120, emoji: '🎯', text: 'Set intentions for the day. Decide how you want to approach the day and what you want to focus on.' },
];



const pollyRegion = localStorage.getItem("pollyRegion");
const pollyApiKey = localStorage.getItem('pollyApiKey');

AWS.config.region = pollyRegion; // Region
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: pollyApiKey,
});


// Replace your existing speak function with this
function speak(text) {

    const usePolly = localStorage.getItem('usePolly') === 'true';
    const pollyApiKey = localStorage.getItem('pollyApiKey');
    const voiceName = localStorage.getItem('pollyVoice');

    if (usePolly && pollyApiKey) {
        // Initialize the Amazon Cognito credentials provider

        const speechParams = {
            OutputFormat: 'mp3',
            Text: text,
            TextType: 'text',
            VoiceId: voiceName
        };

        const polly = new AWS.Polly();
        const signer = new AWS.Polly.Presigner(speechParams, polly);

        signer.getSynthesizeSpeechUrl(speechParams, (error, url) => {
            if (error) {
                console.error('Error synthesizing speech:', error);
            } else {
                const audio = new Audio(url);
                audio.play();
            }
        });
    } else {
        const msg = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(msg);
    }
}
let meditationTimer;
let currentStep = 0;

const progressBar = document.getElementById('progressBar');
const progressBarLabel = document.getElementById('progressBarLabel');
const meditationBtn = document.getElementById('meditationBtn');

const updateProgressBar = (stepIndex, duration) => {
    const stepPercentage = 100 / meditationSteps.length;
    let currentPercentage = stepPercentage * stepIndex;
    const increment = stepPercentage / duration;
    progressBar.style.width = `${currentPercentage}%`;

    const progressBarInterval = setInterval(() => {
        currentPercentage += increment;
        progressBar.style.width = `${currentPercentage}%`;
        if (currentPercentage >= (stepPercentage * (stepIndex + 1))) {
            clearInterval(progressBarInterval);
        }
    }, 1000);
};
const startMeditation = () => {
    const step = meditationSteps[currentStep];
    stepStartTime = Date.now(); // Store the start time

    speak(step.text);
    meditationBtn.innerText = 'Reset Session'; // Change the button text to "Reset Session"
    meditationTimer = setTimeout(nextStep, step.duration * 1000);
    updateProgressBar(currentStep, step.duration);
    progressBarLabel.textContent = `${step.emoji} ${step.text}`;

    const totalDuration = meditationSteps.reduce((acc, step) => acc + step.duration, 0);
    const startTime = Date.now();
};

meditationBtn.addEventListener("click", () => {
    if (!meditationTimer) {
        startMeditation();
    } else {
        // Stop the speech synthesis and refresh the page
        window.speechSynthesis.cancel();
        location.reload();
    }
});


const nextStep = () => {
    currentStep++;
    if (currentStep < meditationSteps.length) {
        startMeditation();
    } else {
        finishMeditation();
    }
};

const finishMeditation = () => {
    clearTimeout(meditationTimer);
    window.speechSynthesis.cancel();
    speak('Your meditation practice is now complete. Have a great day!');
    progressBarLabel.textContent = 'Meditation Complete';
    meditationBtn.innerText = 'Reset Session'; // Change the button text to "Reset Session"
    progressBar.style.width = '0%'; // Reset progress bar
    currentStep = 0;
    meditationTimer = null; // Set meditationTimer to null
};


const settingsBtn = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settingsModal');
const closeModal = document.getElementsByClassName('close')[0];
const settingsForm = document.getElementById('settingsForm');
const pollyApiKeyInput = document.getElementById('pollyApiKey');
const pollyRegionInput = document.getElementById('pollyRegion');
const testModeCheckbox = document.getElementById('testModeCheckbox');
const pollyVoiceInput = document.getElementById('pollyVoice');
const usePollyCheckbox = document.getElementById('usePolly');
const mdeditationStepsTextBox = document.getElementById('meditationSteps');


settingsBtn.addEventListener('click', () => {
    loadSettings();
    settingsModal.style.display = 'block';
});

closeModal.addEventListener('click', () => {
    settingsModal.style.display = 'none';
});

let useTestMode = false;

function loadSettings() {
    const pollyApiKey = localStorage.getItem('pollyApiKey');
    const pollyRegion = localStorage.getItem('pollyRegion');
    const pollyVoice = localStorage.getItem('pollyVoice');
    const usePolly = localStorage.getItem('usePolly') === 'true';
    useTestMode = localStorage.getItem('testMode') === 'true';

    pollyApiKeyInput.value = pollyApiKey || '';
    pollyRegionInput.value = pollyRegion || '';
    pollyVoiceInput.value = pollyVoice || 'Matthew';
    usePollyCheckbox.checked = usePolly;
    testModeCheckbox.checked = useTestMode;

    // Load saved settings
    mdeditationStepsTextBox.value = localStorage.getItem('meditationSteps') || JSON.stringify(meditationSteps);
    meditationSteps = JSON.parse(localStorage.getItem('meditationSteps')) || meditationStepsDefault

    if (useTestMode) {
        meditationSteps.forEach((step) => {
            step.duration = 10;
        });
    }
}

loadSettings();


settingsForm.addEventListener('submit', (e) => {
    e.preventDefault();
    localStorage.setItem('pollyApiKey', pollyApiKeyInput.value);
    localStorage.setItem('pollyRegion', pollyRegionInput.value);
    localStorage.setItem('usePolly', usePollyCheckbox.checked);
    localStorage.setItem('pollyVoice', pollyVoiceInput.value);
    localStorage.setItem('testMode', testModeCheckbox.checked);
    localStorage.setItem('meditationSteps', mdeditationStepsTextBox.value);
    settingsModal.style.display = 'none';
    location.reload();
});

window.addEventListener('click', (event) => {
    if (event.target === settingsModal) {
        settingsModal.style.display = 'none';
    }
});
