import { Injectable } from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class PluginService {
	private GOOGLE_API_KEY = "AIzaSyDr92cSqmmHncSueLdBAMVecPFuhdDUaAQ";
	private dadJokeAPI: string;
	private translateAPI: any;

	constructor() {
		this.dadJokeAPI = "https://icanhazdadjoke.com/";
		this.translateAPI = `https://translation.googleapis.com/language/translate/v2?key=${this.GOOGLE_API_KEY}`;
	}

	/**
	 * Sends a GET request to fetch a dad joke
	 * 
	 * https://icanhazdadjoke.com/api
	 */
	async getDadJoke() {
		try {
			const resp = await fetch(this.dadJokeAPI, {
				method: "GET",
				headers: {
					"Accept": "application/json"
				}
			});

			if (resp.status === 200) {
				const json = await resp.json();
				return json.joke;
			}
		} catch (err) {
			throw new Error(err);
		}
	}

	/**
	 * Sends a POST request to fetch the translate of a text
	 * 
	 * https://cloud.google.com/translate/docs/basic/setup-basic
	 */
	async getTranslate(text: string, targetLang: string) {
		try {
			const resp = await fetch(this.translateAPI, {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					"q": text,
					"source": "en",
					"target": targetLang,
					"format": "text"
				})
			});

			if (resp.status === 200) {
				const json = await resp.json();
				return json.data.translations[0].translatedText;
			}
		} catch (err) {
			throw new Error(err);
		}
	}
}
