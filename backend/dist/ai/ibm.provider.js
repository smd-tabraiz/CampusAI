"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IbmWatsonxProvider = void 0;
const config_1 = require("../config");
class IbmWatsonxProvider {
    name = 'IBM watsonx.ai / IBM Bob';
    iamToken = null;
    tokenExpiry = 0;
    isConfigured() {
        return !!(config_1.config.ibmApiKey && config_1.config.ibmProjectId);
    }
    async getIamToken() {
        if (this.iamToken && Date.now() < this.tokenExpiry) {
            return this.iamToken;
        }
        const response = await fetch('https://iam.cloud.ibm.com/identity/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Accept: 'application/json'
            },
            body: new URLSearchParams({
                grant_type: 'urn:ibm:params:oauth:grant-type:apikey',
                apikey: config_1.config.ibmApiKey
            })
        });
        if (!response.ok) {
            throw new Error(`IBM IAM Token exchange failed: ${response.statusText}`);
        }
        const data = (await response.json());
        this.iamToken = data.access_token;
        // Expire 5 mins early
        this.tokenExpiry = Date.now() + (data.expires_in - 300) * 1000;
        return this.iamToken;
    }
    async generateResponse(prompt, context, history) {
        if (!this.isConfigured()) {
            throw new Error('IBM watsonx is not configured. Falling back to local smart provider.');
        }
        const token = await this.getIamToken();
        const endpoint = `${config_1.config.ibmUrl}/ml/v1/text/generation?version=2023-05-29`;
        const systemInstruction = `You are CampusAI, an intelligent campus companion for college students and faculty.
Campus Context: Student Name: ${context?.userName || 'Student'}, Department: ${context?.department || 'General'}, Preferred Hostel: ${context?.preferredHostel || 'Campus Hostels'}.
Provide helpful, concise, hyperlocal campus advice. Do not fabricate locations or rules.`;
        const fullPrompt = `${systemInstruction}\n\n` +
            (history ? history.map(h => `${h.sender === 'USER' ? 'Student' : 'CampusAI'}: ${h.content}`).join('\n') + '\n' : '') +
            `Student: ${prompt}\nCampusAI:`;
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                model_id: 'ibm/granite-13b-chat-v2',
                project_id: config_1.config.ibmProjectId,
                input: fullPrompt,
                parameters: {
                    decoding_method: 'greedy',
                    max_new_tokens: 400,
                    min_new_tokens: 1,
                    repetition_penalty: 1.1
                }
            })
        });
        if (!response.ok) {
            throw new Error(`IBM watsonx generation failed: ${response.statusText}`);
        }
        const data = (await response.json());
        const generated = data.results?.[0]?.generated_text?.trim();
        if (!generated) {
            throw new Error('Empty response from IBM watsonx');
        }
        return generated;
    }
}
exports.IbmWatsonxProvider = IbmWatsonxProvider;
