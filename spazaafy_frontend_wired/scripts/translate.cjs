// scripts/translate.js

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

// --- Configuration ---
// Your credentials are now safely loaded from the .env file
const subscriptionKey = process.env.TRANSLATOR_KEY;
const endpoint = process.env.TRANSLATOR_ENDPOINT;
const region = process.env.TRANSLATOR_REGION;

if (!subscriptionKey || !endpoint || !region) {
    console.error("Please make sure TRANSLATOR_KEY, TRANSLATOR_ENDPOINT, and TRANSLATOR_REGION are set in your .env file.");
    process.exit(1);
}

const localesDir = path.join(__dirname, '..', 'src', 'locales');
const sourceLang = 'en';
const targetLangs = ['zu', 'xh']; // Zulu, Xhosa

// --- Main Function ---
async function runTranslation() {
  console.log('Starting translation process with Microsoft Translator...');

  const sourceFilePath = path.join(localesDir, sourceLang, 'translation.json');
  if (!fs.existsSync(sourceFilePath)) {
    console.error(`Source file not found at ${sourceFilePath}`);
    return;
  }
  const sourceContent = JSON.parse(fs.readFileSync(sourceFilePath, 'utf8'));

  for (const lang of targetLangs) {
    console.log(`\nTranslating to ${lang}...`);
    const targetFilePath = path.join(localesDir, lang, 'translation.json');
    const translatedContent = JSON.parse(JSON.stringify(sourceContent));
    
    const translationPromises = [];
    
    function findStrings(obj) {
        for (const key in obj) {
            if (typeof obj[key] === 'string') {
                const originalString = obj[key];
                const placeholderRegex = /{{\s*(\w+)\s*}}/g;
                const placeholders = [...originalString.matchAll(placeholderRegex)];
                const textToTranslate = originalString.replace(placeholderRegex, 'PLACEHOLDER').trim();

                const promise = axios({
                    baseURL: endpoint,
                    url: '/translate',
                    method: 'post',
                    headers: {
                        'Ocp-Apim-Subscription-Key': subscriptionKey,
                        'Ocp-Apim-Subscription-Region': region,
                        'Content-type': 'application/json',
                        'X-ClientTraceId': uuidv4().toString()
                    },
                    params: {
                        'api-version': '3.0',
                        'from': sourceLang,
                        'to': lang
                    },
                    data: [{ 'text': textToTranslate }],
                    responseType: 'json'
                }).then(response => {
                    let finalTranslation = response.data[0].translations[0].text;
                    if (placeholders.length > 0) {
                        placeholders.forEach(() => {
                            finalTranslation = finalTranslation.replace(/PLACEHOLDER/i, (match) => placeholders.shift()[0]);
                        });
                    }
                    obj[key] = finalTranslation;
                }).catch(err => {
                    console.error(`Error translating "${textToTranslate}":`, err.response ? err.response.data : err.message);
                });
                translationPromises.push(promise);

            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                findStrings(obj[key]);
            }
        }
    }

    findStrings(translatedContent);
    
    await Promise.all(translationPromises);
    
    fs.mkdirSync(path.dirname(targetFilePath), { recursive: true });
    fs.writeFileSync(targetFilePath, JSON.stringify(translatedContent, null, 2), 'utf8');
    
    console.log(`Successfully created ${targetFilePath}`);
  }
  
  console.log('\nTranslation process finished!');
}

runTranslation().catch(console.error);