// --- API & App Configuration for Verba AI ---

const CONFIG = {
    // Gemini API Configuration
    API: {
        GEMINI_API_KEY: 'AIzaSyATbG3NKt3ojMWV3OtIloBV1MQzMZL7_BY', // IMPORTANT: Replace with your actual Gemini API Key
        GEMINI_ENDPOINT: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent',
        TEMPERATURE: 0.3,
        MAX_TOKENS: 2000,
    },

    // Geolocation API Configuration
    GEOLOCATION: {
        ENDPOINT: 'https://ipapi.co/json/',
        FALLBACK_LANGUAGE: { code: 'en', name: 'English' }, // Fallback if everything else fails
    },
    
    // --- State-wise Language Mapping ---
    LOCATION_LANGUAGE_MAP: {
        'IN': {
            'Andhra Pradesh': { code: 'te', name: 'Telugu' },
            'Arunachal Pradesh': { code: 'en', name: 'English' },
            'Assam': { code: 'as', name: 'Assamese' },
            'Bihar': { code: 'hi', name: 'Hindi' },
            'Chhattisgarh': { code: 'hi', name: 'Hindi' },
            'Goa': { code: 'kok', name: 'Konkani' },
            'Gujarat': { code: 'gu', name: 'Gujarati' },
            'Haryana': { code: 'hi', name: 'Hindi' },
            'Himachal Pradesh': { code: 'hi', name: 'Hindi' },
            'Jharkhand': { code: 'hi', name: 'Hindi' },
            'Karnataka': { code: 'kn', name: 'Kannada' },
            'Kerala': { code: 'ml', name: 'Malayalam' },
            'Madhya Pradesh': { code: 'hi', name: 'Hindi' },
            'Maharashtra': { code: 'mr', name: 'Marathi' },
            'Manipur': { code: 'mni', name: 'Meitei' },
            'Meghalaya': { code: 'en', name: 'English' },
            'Mizoram': { code: 'lus', name: 'Mizo' },
            'Nagaland': { code: 'en', name: 'English' },
            'Odisha': { code: 'or', name: 'Odia' },
            'Punjab': { code: 'pa', name: 'Punjabi' },
            'Rajasthan': { code: 'hi', name: 'Hindi' },
            'Sikkim': { code: 'ne', name: 'Nepali' },
            'Tamil Nadu': { code: 'ta', name: 'Tamil' },
            'Telangana': { code: 'te', name: 'Telugu' },
            'Tripura': { code: 'bn', name: 'Bengali' },
            'Uttar Pradesh': { code: 'hi', name: 'Hindi' },
            'Uttarakhand': { code: 'hi', name: 'Hindi' },
            'West Bengal': { code: 'bn', name: 'Bengali' },
            '_default': { code: 'hi', name: 'Hindi' } // Default for India if state not listed
        },
        'US': { code: 'en', name: 'English' },
        'GB': { code: 'en', name: 'English' },
        'ES': { code: 'es', name: 'Spanish' },
        'FR': { code: 'fr', name: 'French' },
        'DE': { code: 'de', name: 'German' },
        'IT': { code: 'it', name: 'Italian' },
        'JP': { code: 'ja', name: 'Japanese' },
        'KR': { code: 'ko', name: 'Korean' },
        'CN': { code: 'zh', name: 'Chinese' },
        'RU': { code: 'ru', name: 'Russian' },
        'BR': { code: 'pt', name: 'Portuguese' }
        // Add other countries as needed
    },

    // Error Messages
    ERRORS: {
        NO_API_KEY: 'API key not found. Please add your Gemini API key in config.js',
        API_ERROR: 'Translation service unavailable. Please try again later.',
        EMPTY_TEXT: 'Please enter text to translate.',
    }
};

