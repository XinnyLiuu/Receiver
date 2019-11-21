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
	private received: Array<any>; // List of received messages
	private sent: Array<any>; // List of sent messages
	private isDarkMode: boolean;
	private username: string;

	constructor(
		private router: Router,
		private messageService: MessagesService,
		private userService: UserService,
		private darkModeService: DarkModeService) {
	}

	ngOnInit() {
		this.received = [];
		this.sent = [];
		this.username = this.userService.username;

		// Firebase realtime calls
		const ref = this.messageService.ref;

		// Get all the messages where the current user is the sender
		ref.where("sender", "==", this.username).onSnapshot(querySnapshot => {

			// Keep a set of recipients to avoid duplicate conversations
			let recipients = new Set();

			let sentMessages = [];
			querySnapshot.forEach(doc => {
				const recipient = doc.data().recipient;
				const text = doc.data().message;
				const timestamp = doc.data().timestamp;

				// Check if this recipient already shows up on the list of chats and show the most recent conversation
				if (recipients.has(recipient)) {
					sentMessages.forEach(c => {
						if (c.contact === recipient &&
							Date.parse(timestamp) > Date.parse(c.timestamp)) {
							c.text = text;
							c.timestamp = timestamp;
						}
					});
				}
				else {
					sentMessages.push({
						contact: recipient,
						text: text,
						timestamp: timestamp
					});

					recipients.add(recipient);
				}
			});

			this.sent = sentMessages;
		});

		// Get all the messages where the current user is the recipient
		ref.where("recipient", "==", this.username).onSnapshot(querySnapshot => {

			// Keep a set of senders to avoid duplicate conversations
			let senders = new Set();

			let receivedMessages = [];
			querySnapshot.forEach(doc => {
				const sender = doc.data().sender;
				const text = doc.data().message;
				const timestamp = doc.data().timestamp;

				// Check if this sender already shows up on the list of chats and show the most recent conversation
				if (senders.has(sender)) {
					receivedMessages.forEach(c => {
						if (c.contact === sender &&
							Date.parse(timestamp) > Date.parse(c.timestamp)) {
							c.text = text;
							c.timestamp = timestamp;
						}
					});
				}
				else {
					receivedMessages.push({
						contact: sender,
						text: text,
						timestamp: timestamp
					});

					senders.add(sender);
				}
			});

			this.received = receivedMessages;
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
