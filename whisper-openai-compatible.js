import { getRequestHeaders } from '../../../../script.js';
export { WhisperOpenAICompatibleSttProvider };

const DEBUG_PREFIX = '<Speech Recognition module (Whisper OpenAI-Compatible)> ';

class WhisperOpenAICompatibleSttProvider {
    settings;

    defaultSettings = {
        language: '',
        apiBaseUrl: 'https://api.openai.com/v1/audio/transcriptions',
        model: '',
    };

    get settingsHtml() {
        let html = `
        <div>
            <span>API Base URL</span><br>
            <input id="whisper_openai_compat_base_url" class="text_pole" type="text" placeholder="http://localhost:28100/v1/audio/transcriptions">
            <div><i>URL must include the transcription route, e.g. /v1/audio/transcriptions</i></div>
        </div>
        <div>
            <span>Model (optional)</span><br>
            <input id="whisper_openai_compat_model" class="text_pole" type="text" placeholder="whisper-large">
        </div>`;
        return html;
    }

    onSettingsChange() {
        this.settings.apiBaseUrl = $('#whisper_openai_compat_base_url').val();
        this.settings.model = $('#whisper_openai_compat_model').val();
    }

    loadSettings(settings) {
        if (Object.keys(settings).length == 0) {
            console.debug(DEBUG_PREFIX + 'Using default Whisper (OpenAI-Compatible) STT extension settings');
        }

        this.settings = { ...this.defaultSettings };
        for (const key in settings) {
            if (key in this.settings) {
                this.settings[key] = settings[key];
            } else {
                throw `Invalid setting passed to STT extension: ${key}`;
            }
        }

        $('#speech_recognition_language').val(this.settings.language);
        $('#whisper_openai_compat_base_url').val(this.settings.apiBaseUrl);
        $('#whisper_openai_compat_model').val(this.settings.model);
        console.debug(DEBUG_PREFIX + 'Whisper (OpenAI-Compatible) STT settings loaded');
    }

    async processAudio(audioBlob) {
        const requestData = new FormData();
        requestData.append('file', audioBlob, 'record.wav');
        if (this.settings.model) {
            requestData.append('model', this.settings.model);
        }
        if (this.settings.language) {
            requestData.append('language', this.settings.language);
        }
        requestData.append('response_format', 'json');

        const headers = getRequestHeaders();
        delete headers['Content-Type'];

        const apiResult = await fetch(this.settings.apiBaseUrl, {
            method: 'POST',
            headers: headers,
            body: requestData,
        });

        if (!apiResult.ok) {
            toastr.error(apiResult.statusText, 'STT Generation Failed (Whisper OpenAI-Compatible)', { timeOut: 10000, extendedTimeOut: 20000, preventDuplicates: true });
            throw new Error(`HTTP ${apiResult.status}: ${await apiResult.text()}`);
        }

        const result = await apiResult.json();
        return result.text;
    }
}

