import { Injectable } from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class PluginService {
	private GIPHY_API_KEY: string = "HHY7c61ffqupiFH4YK28NAcCey6FABK1";
	private GOOGLE_API_KEY: string = "AIzaSyDr92cSqmmHncSueLdBAMVecPFuhdDUaAQ";

	private dadJokeAPI: string;
	private translateAPI: string;
	private giphyAPI: string;
	private geocodingAPI: string;

	constructor() {
		this.dadJokeAPI = "https://icanhazdadjoke.com/";
		this.translateAPI = `https://translation.googleapis.com/language/translate/v2?key=${this.GOOGLE_API_KEY}`;
		this.giphyAPI = `https://api.giphy.com/v1/gifs/random?api_key=${this.GIPHY_API_KEY}`;
		this.geocodingAPI = `https://maps.googleapis.com/maps/api/geocode/json`; // ?latlng=${lat},${long}&key=${API_KEY}
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

	/**
	 * Sends a GET request to fetch a random GIF related to the tag inputted
	 * 
	 * https://developers.giphy.com/docs/api/
	 * 
	 * @param tag 
	 */
	async getGIF(tag: string) {
		try {
			const resp = await fetch(`${this.giphyAPI}&tag=${tag}&rating=R`, {
				method: "GET"
			});

			if (resp.status === 200) {
				const json = await resp.json();
				return json.data.images.fixed_height_small.url; // Return the URL of the gif
			}
		} catch (err) {
			throw new Error(err);
		}
	}

	/**
	 * Sends a GET request to fetch the location from based on lat and long
	 * 
	 * https://developers.google.com/maps/documentation/geocoding/start
	 * 
	 * @param lat 
	 * @param long 
	 */
	async getLocation(lat: number, long: number) {
		try {
			const resp = await fetch(`${this.geocodingAPI}?latlng=${lat},${long}&key=${this.GOOGLE_API_KEY}`, {
				method: "GET"
			});

			if (resp.status === 200) {
				const json = await resp.json();
				return json.results[0].formatted_address;
			}
		} catch (err) {
			throw new Error(err);
		}
	}
}
