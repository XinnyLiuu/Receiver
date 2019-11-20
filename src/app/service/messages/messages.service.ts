import { Injectable } from '@angular/core';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable({
	providedIn: 'root'
})
export class MessagesService {
	private db; // firebase 
	public ref; // firebase collection refreference

	constructor(private firebaseService: FirebaseService) {
		this.db = this.firebaseService.db;
		this.ref = this.db.collection("messages");
	}

	getMessagesForUser(username: string, chats: Array<any>) {
		// TODO: Message page logic should be converted here later down the line
	}
}
