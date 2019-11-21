import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";

import { UserService } from "../service/user/user.service";
import { MessagesService } from "../service/messages/messages.service";
import { DarkModeService } from "../service/dark-mode/dark-mode.service";

@Component({
	selector: 'app-messages',
	templateUrl: './messages.page.html',
	styleUrls: ['./messages.page.scss'],
})
export class MessagesPage implements OnInit {
	private chats: Array<any>;
	private isDarkMode: boolean;

	constructor(
		private router: Router,
		private messageService: MessagesService,
		private userService: UserService,
		private darkModeService: DarkModeService) {
	}

	ngOnInit() {
		// Get all chats that the user has from firestore via realtime
		this.chats = [];
		const username = this.userService.username;
		const ref = this.messageService.ref;

		ref.where("sender", "==", username)
			.onSnapshot(querySnapshot => {
				let conversations = []; // Store all conversations where the user is the sender
				let recipients = new Set(); // Keep a set of recipients to avoid duplicate conversations

				querySnapshot.forEach(doc => {
					const recipient = doc.data().recipient;
					const text = doc.data().text;
					const timestamp = doc.data().timestamp;

					// Check if this recipient already shows up on the list of chats and show the most recent conversation
					if (recipients.has(recipient)) {
						conversations.forEach(c => {
							if (c.contact === recipient &&
								Date.parse(timestamp) > Date.parse(c.timestamp)) {
								c.text = text;
								c.timestamp = timestamp;
							}
						});
					}
					else {
						conversations.push({
							contact: recipient,
							text: text,
							timestamp: timestamp
						});

						recipients.add(recipient);
					}
				});

				this.chats = conversations;
			});

		// Dark Mode
		const toggle: any = document.querySelector('#themeToggle');
		this.isDarkMode = this.darkModeService.isDarkMode;
		this.darkModeService.toggleDarkMode(toggle);
	}

	/**
	 * Opens the chat with the point of contact
	 * 
	 * @param contact 
	 */
	openChat(contact) {
		return this.router.navigate(['/chat', contact]);
	}

	/**
	 * Calls the user service to log out the user and redirect to login
	 */
	doLogout() {
		this.userService.logout();
		window.location.reload();
	}
}
