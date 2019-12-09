import { Injectable } from '@angular/core';
import SimpleCrypto from "simple-crypto-js";
import { sha256 } from "js-sha256";

@Injectable({
	providedIn: 'root'
})
export class CryptoService {
	private sc: SimpleCrypto;

	constructor() {
		this.sc = new SimpleCrypto("EncryptionIsGood");
	}

	/**
	 * Generates a random 128 salt
	 */
	getSalt() {
		return SimpleCrypto.generateRandom();
	}

	/**
	 * Encrypt password 
	 * 
	 * @param message
	 * @param salt
	 */
	hash(password: string, salt: string) {
		/**
		 * Should be done back-end, but for the sake of this project this is better than nothing
		 */
		password = sha256(password + salt);
		return password;
	}

	/**
	 * Encrypts the message
	 * 
	 * @param message 
	 */
	encrypt(message: string) {
		return this.sc.encrypt(message);
	}

	/**
	 * Decrypts the message
	 * 
	 * @param message
	 */
	decrypt(message: string) {
		return this.sc.decrypt(message);
	}
}
