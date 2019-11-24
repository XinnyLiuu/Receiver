import { Injectable } from '@angular/core';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable({
	providedIn: 'root'
})
export class MessagesService {
	private db; // firebase 
	private ref; // firebase collection reference

	constructor(private firebaseService: FirebaseService) {
		this.db = this.firebaseService.db;
		this.ref = this.db.collection("messages");
	}

	/**
	 * Returns the reference to the firebase collection
	 */
	getRef() {
		return this.ref;
	}

	/**
	 * Adds a message to the Messages collection
	 * 
	 * @param sender 
	 * @param recipient 
	 * @param message 
	 */
	async createMessage(sender: string, recipient: string, message: string): Promise<boolean> {
		try {
			// Prepare message object
			let messageObj = {
				sender: sender,
				recipient: recipient,
				message: message, // TODO: Encrypt
				timestamp: Date.parse(new Date().toLocaleString()),
				giphy: false
			}

			// Check if the message is a giphy url
			if (message.includes("https://") && message.includes("giphy") && message.includes("media")) messageObj["giphy"] = true;

			await this.ref.add(messageObj);

			return true;
		} catch (err) {
			return false;
		}
	}
}
