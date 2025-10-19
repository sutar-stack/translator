// --- DOM Elements ---
const detectLocationBtn = document.getElementById('detect-location-btn');
const translateBtn = document.getElementById('translate-btn');
const voiceInputBtn = document.getElementById('voice-input-btn');
const speakOutputBtn = document.getElementById('speak-output-btn');
const targetLanguageSelect = document.getElementById('language-select');
const sourceLanguageSelect = document.getElementById('source-language-select');

const locationInfoDiv = document.getElementById('location-info');
const locationStatus = document.getElementById('location-status');
const languageStatus = document.getElementById('language-status');
const detectedLanguageStatus = document.getElementById('detected-language-status');

const loaderLocation = document.getElementById('loader-location');
const loaderTranslate = document.getElementById('loader-translate');
const inputText = document.getElementById('input-text');
const outputText = document.getElementById('output-text');

// --- Global State ---
let targetLanguage = CONFIG.GEOLOCATION.FALLBACK_LANGUAGE;
let sourceLanguage = { code: 'auto', name: 'Auto-Detect' };
let synthVoices = [];
let debounceTimer; // Timer for auto-translation

// --- Initialize Speech APIs ---
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;
if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
} else {
    if(voiceInputBtn) voiceInputBtn.style.display = 'none';
}

// --- EVENT LISTENERS ---
document.addEventListener('DOMContentLoaded', initializeApp);
detectLocationBtn.addEventListener('click', getUserLocation);
translateBtn.addEventListener('click', handleTranslation);
targetLanguageSelect.addEventListener('change', handleManualTargetLanguageChange);
sourceLanguageSelect.addEventListener('change', handleManualSourceLanguageChange);
inputText.addEventListener('input', handleAutoTranslation); // **NEW**: Trigger translation on input

if (recognition) {
    voiceInputBtn.addEventListener('click', startSpeechRecognition);
    recognition.onresult = handleSpeechResult;
    recognition.onstart = () => voiceInputBtn.classList.add('recording');
    recognition.onend = () => voiceInputBtn.classList.remove('recording');
    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        voiceInputBtn.classList.remove('recording');
    };
}
speakOutputBtn.addEventListener('click', speakTranslatedText);

// --- INITIALIZATION ---
function initializeApp() {
    const allLanguages = getAllLanguages();
    populateLanguageDropdown(targetLanguageSelect, allLanguages, targetLanguage.code);
    populateLanguageDropdown(sourceLanguageSelect, allLanguages, sourceLanguage.code, true);
    loadVoices();
}

function getAllLanguages() {
    const languages = new Map();
    Object.values(CONFIG.LOCATION_LANGUAGE_MAP).forEach(country => {
        if (country.code && !languages.has(country.code)) {
            languages.set(country.code, country.name);
        } else if (typeof country === 'object') {
            Object.values(country).forEach(state => {
                 if (state.code && !languages.has(state.code)) {
                    languages.set(state.code, state.name);
                }
            });
        }
    });
    return [...languages.entries()].sort((a, b) => a[1].localeCompare(b[1]));
}

function populateLanguageDropdown(selectElement, languages, selectedCode, includeAutoDetect = false) {
    if (includeAutoDetect) {
        const autoOption = document.createElement('option');
        autoOption.value = 'auto';
        autoOption.textContent = 'Auto-Detect';
        selectElement.appendChild(autoOption);
    }
    languages.forEach(([code, name]) => {
        const option = document.createElement('option');
        option.value = code;
        option.textContent = name;
        selectElement.appendChild(option);
    });
    selectElement.value = selectedCode;
}

function loadVoices() {
    synthVoices = window.speechSynthesis.getVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => synthVoices = window.speechSynthesis.getVoices();
    }
}

// --- CORE FUNCTIONS ---

/**
 * **NEW**: Handles auto-translation with a debounce delay.
 */
function handleAutoTranslation() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        const text = inputText.value.trim();
        if (text) {
            handleTranslation();
        } else {
            // Clear the output if the input is empty
            outputText.innerHTML = 'Translation will appear here...';
            speakOutputBtn.classList.add('hidden');
        }
    }, 500); // Wait for 500ms after user stops typing
}

function handleManualTargetLanguageChange() {
    const selectedCode = targetLanguageSelect.value;
    const selectedName = targetLanguageSelect.options[targetLanguageSelect.selectedIndex].text;
    targetLanguage = { code: selectedCode, name: selectedName };
    languageStatus.textContent = `Target Language set to: ${targetLanguage.name}`;
    handleAutoTranslation(); // Re-translate with the new language
}

function handleManualSourceLanguageChange() {
    const selectedCode = sourceLanguageSelect.value;
    const selectedName = sourceLanguageSelect.options[sourceLanguageSelect.selectedIndex].text;
    sourceLanguage = { code: selectedCode, name: selectedName };
    detectedLanguageStatus.textContent = ''; // Clear detected status
    handleAutoTranslation(); // Re-translate with the new language
}

async function getUserLocation() {
    locationInfoDiv.classList.remove('hidden');
    loaderLocation.classList.remove('hidden');
    locationStatus.textContent = 'Detecting your location...';
    languageStatus.textContent = '';
    detectLocationBtn.disabled = true;

    try {
        const response = await fetch(CONFIG.GEOLOCATION.ENDPOINT);
        if (!response.ok) throw new Error('Failed to fetch location data.');
        
        const data = await response.json();
        const { country_code, region, city, country_name } = data;
        
        let langInfo = CONFIG.GEOLOCATION.FALLBACK_LANGUAGE;
        const countryMapping = CONFIG.LOCATION_LANGUAGE_MAP[country_code];

        if (countryMapping) {
            if (typeof countryMapping === 'object' && !countryMapping.code) {
                langInfo = countryMapping[region] || countryMapping['_default'] || langInfo;
            } else {
                langInfo = countryMapping;
            }
        }

        targetLanguage = langInfo;
        const locationString = region ? `${city}, ${region}, ${country_name}` : `${city}, ${country_name}`;
        locationStatus.textContent = `Location Detected: ${locationString}`;
        languageStatus.textContent = `Target Language: ${targetLanguage.name}`;
        targetLanguageSelect.value = targetLanguage.code;

    } catch (error) {
        console.error('Geolocation Error:', error);
        locationStatus.textContent = 'Could not detect location.';
        targetLanguage = CONFIG.GEOLOCATION.FALLBACK_LANGUAGE;
        languageStatus.textContent = `Defaulting to ${targetLanguage.name}.`;
        targetLanguageSelect.value = targetLanguage.code;
    } finally {
        loaderLocation.classList.add('hidden');
        detectLocationBtn.disabled = false;
    }
}

function startSpeechRecognition() {
    if (recognition) {
        try {
            recognition.lang = sourceLanguage.code === 'auto' ? '' : sourceLanguage.code;
            recognition.start();
        } catch (error) {
            console.error("Speech recognition could not be started: ", error);
            alert("Speech recognition is busy. Please try again in a moment.");
        }
    }
}

async function handleSpeechResult(event) {
    const transcript = event.results[0][0].transcript;
    inputText.value = transcript;

    if (sourceLanguage.code === 'auto' && transcript) {
        await detectLanguageFromText(transcript);
    }
    
    if (transcript) {
        handleTranslation();
    }
}

async function detectLanguageFromText(text) {
    detectedLanguageStatus.textContent = "Detecting...";
    const prompt = `Identify the language of the following text. Respond with ONLY the name of the language (e.g., 'Spanish', 'Malayalam'). Text: "${text}"`;
    
    try {
        const detectedName = await callGemini(prompt);
        if (detectedName) {
            const allLangs = getAllLanguages();
            const foundLang = allLangs.find(([code, name]) => name.trim().toLowerCase() === detectedName.trim().toLowerCase());
            
            if (foundLang) {
                const [code, name] = foundLang;
                detectedLanguageStatus.textContent = `Detected: ${name}`;
            } else {
                detectedLanguageStatus.textContent = "Language not supported";
            }
        }
    } catch (error) {
        console.error("Language detection error:", error);
        detectedLanguageStatus.textContent = "Detection failed";
    }
}

function speakTranslatedText() {
    const textToSpeak = outputText.textContent;
    if (!textToSpeak || textToSpeak.includes('...')) return;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = targetLanguage.code;
    utterance.voice = synthVoices.find(voice => voice.lang.startsWith(targetLanguage.code)) || null;

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
}

async function handleTranslation() {
    const text = inputText.value.trim();
    if (!text) {
        outputText.innerHTML = `<span class="text-gray-400">${CONFIG.ERRORS.EMPTY_TEXT}</span>`;
        speakOutputBtn.classList.add('hidden');
        return;
    }

    loaderTranslate.classList.remove('hidden');
    translateBtn.disabled = true;
    outputText.textContent = '';

    const sourceLangName = sourceLanguageSelect.value === 'auto' ? 'the auto-detected language' : sourceLanguageSelect.options[sourceLanguageSelect.selectedIndex].text;
    const prompt = `Translate the following text from ${sourceLangName} to ${targetLanguage.name}. Provide ONLY the translated text, without any additional explanations, context, or quotation marks.\n\nText: "${text}"`;
    
    try {
        const translatedText = await callGemini(prompt);
        if (translatedText) {
            outputText.textContent = translatedText.trim();
            speakOutputBtn.classList.remove('hidden');
        } else {
            throw new Error("Received an empty response from the API.");
        }
    } catch(error) {
        outputText.innerHTML = `<span class="text-red-500">${error.message}</span>`;
        speakOutputBtn.classList.add('hidden');
    } finally {
        loaderTranslate.classList.add('hidden');
        translateBtn.disabled = false;
    }
}

async function callGemini(prompt) {
    if (!CONFIG.API.GEMINI_API_KEY || CONFIG.API.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
        throw new Error(CONFIG.ERRORS.NO_API_KEY);
    }
    
    try {
        const response = await fetch(`${CONFIG.API.GEMINI_ENDPOINT}?key=${CONFIG.API.GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: CONFIG.API.TEMPERATURE,
                    maxOutputTokens: CONFIG.API.MAX_TOKENS,
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('API Error Response:', errorData);
            throw new Error(errorData.error?.message || `API Error: ${response.status}`);
        }

        const data = await response.json();
        if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
            return data.candidates[0].content.parts[0].text;
        } else {
             return null;
        }
    } catch (error) {
        console.error('Gemini API Call Error:', error);
        throw new Error(CONFIG.ERRORS.API_ERROR);
    }
}

