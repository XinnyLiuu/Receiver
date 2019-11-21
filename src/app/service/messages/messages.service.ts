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

	/**
	 * Given the username, return a promise 
	 * @param username 
	 */
	getMessagesForUser(username: string): Promise<Array<any>> {
		return new Promise((resolve, reject) => {
			this.ref.where("sender", "==", username)
				.onSnapshot(querySnapshot => {
					// Keep a set of recipients to avoid duplicate conversations
					let recipients = new Set();

					let messages = [];
					querySnapshot.forEach(doc => {
						const recipient = doc.data().recipient;
						const text = doc.data().message;
						const timestamp = doc.data().timestamp;

						// Check if this recipient already shows up on the list of chats and show the most recent conversation
						if (recipients.has(recipient)) {
							messages.forEach(c => {
								if (c.contact === recipient &&
									Date.parse(timestamp) > Date.parse(c.timestamp)) {
									c.text = text;
									c.timestamp = timestamp;
								}
							});
						}
						else {
							messages.push({
								contact: recipient,
								text: text,
								timestamp: timestamp
							});

							recipients.add(recipient);
						}
					});

					console.log(messages);
					resolve(messages)
				})

		})
		// this.ref.where("sender", "==", username)
		// 	.onSnapshot(querySnapshot => {

		// 		return new Promise((resolve, reject) => {
		// 			// Keep a set of recipients to avoid duplicate conversations
		// 			let recipients = new Set();

		// 			let messages = [];
		// 			querySnapshot.forEach(doc => {
		// 				const recipient = doc.data().recipient;
		// 				const text = doc.data().message;
		// 				const timestamp = doc.data().timestamp;

		// 				// Check if this recipient already shows up on the list of chats and show the most recent conversation
		// 				if (recipients.has(recipient)) {
		// 					messages.forEach(c => {
		// 						if (c.contact === recipient &&
		// 							Date.parse(timestamp) > Date.parse(c.timestamp)) {
		// 							c.text = text;
		// 							c.timestamp = timestamp;
		// 						}
		// 					});
		// 				}
		// 				else {
		// 					messages.push({
		// 						contact: recipient,
		// 						text: text,
		// 						timestamp: timestamp
		// 					});

		// 					recipients.add(recipient);
		// 				}
		// 			});

		// 			console.log(messages);
		// 			resolve(messages)
		// 		})

		// 	});

		// return new Promise((resolve, reject) => resolve([]));
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
