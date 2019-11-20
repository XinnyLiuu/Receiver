import { Injectable } from '@angular/core';
import SimpleCrypto from "simple-crypto-js";
import { sha256 } from "js-sha256";

@Injectable({
	providedIn: 'root'
})
export class CryptoService {
	constructor() {
	}

	/**
	 * Generates a random 128 salt
	 */
	getSalt() {
		return SimpleCrypto.generateRandom();
	}

	/**
	 * Encrypt password 
	 */
	hash(password: string, salt: string) {
		/**
		 * Should be done back-end, but for the sake of this project this is better than nothing
		 */
		password = sha256(password + salt);
		return password;
	}
}
