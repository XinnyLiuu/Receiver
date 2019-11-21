import { Injectable } from '@angular/core';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable({
	providedIn: 'root'
})
export class MessagesService {
	private db; // firebase 
	public ref; // firebase collection reference

	constructor(private firebaseService: FirebaseService) {
		this.db = this.firebaseService.db;
		this.ref = this.db.collection("messages");
	}

	getMessagesForUser(username: string, chats: Array<any>) {
		// TODO: Message page logic should be converted here later down the line
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
			await this.ref.add({
				sender: sender,
				recipient: recipient,
				message: message, // TODO: Encrypt
				timestamp: Date.parse(new Date().toLocaleString())
			});

			return true;
		} catch (err) {
			return false;
		}
	}
}
