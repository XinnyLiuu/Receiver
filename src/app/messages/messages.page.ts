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
	private sent: Array<any>; // List of sent messages
	private received: Array<any>; // List of received messages
	private isDarkMode: boolean;
	private username: string;
	private fullName: string;

	constructor(
		private router: Router,
		private darkModeService: DarkModeService,
		private messageService: MessagesService,
		private userService: UserService) {
	}

	ngOnInit() {
		// Get all the messages where the current user is involved
		this.sent = [];
		this.username = this.userService.getUsername();
		this.fullName = this.userService.getFullName();
		this.getSentMessages();
		this.getNewMessages();

		// Dark Mode
		this.darkModeService.init();
		this.isDarkMode = this.darkModeService.getIsDarkMode();
	}

	/**
	 * Query firebase for all messages
	 */
	getSentMessages() {
		this.messageService.getRef()
			.where("sender", "==", this.username)
			.onSnapshot(querySnapshot => {
				let sent = [];
				let data = [];

				// Keep a set of recipients to avoid duplicate conversations
				let recipients = {};

				// Gather the documents
				querySnapshot.forEach(doc => {
					data.push(doc.data());
				});

				// Sort documents 
				data.sort((a, b) => a.timestamp > b.timestamp ? 1 : -1);

				// Go through each document
				data.forEach(d => {
					const contact = d.recipient;
					const message = d.message;
					const timestamp = d.timestamp;

					if (recipients.hasOwnProperty(contact) && recipients[contact].timestamp < timestamp) {
						recipients[contact] = {
							text: message,
							timestamp: new Date(timestamp).toLocaleString()
						}
					} else {
						recipients[contact] = {
							contact: contact,
							text: message,
							timestamp: new Date(timestamp).toLocaleString()
						};
					}
				});

				// Go through each recipient and add it to the message array
				Object.keys(recipients).forEach(r => {
					sent.push(recipients[r]);
				})

				this.sent = sent;
			});
	}

	/**
	 * Query firebase for sent messages
	 */
	getNewMessages() {
		this.messageService.getRef()
			.where("recipient", "==", this.username)
			.onSnapshot(querySnapshot => {
				let received = [];
				let data = [];

				// Keep a set of recipients to avoid duplicate conversations
				let recipients = {};

				// Gather the documents
				querySnapshot.forEach(doc => {
					data.push(doc.data());
				});

				// Sort documents 
				data.sort((a, b) => a.timestamp > b.timestamp ? 1 : -1);

				// Go through each document
				data.forEach(d => {
					const contact = d.recipient;
					const message = d.message;
					const timestamp = d.timestamp;

					if (recipients.hasOwnProperty(contact) && recipients[contact].timestamp < timestamp) {
						recipients[contact] = {
							text: message,
							timestamp: new Date(timestamp).toLocaleString()
						}
					} else {
						recipients[contact] = {
							contact: contact,
							text: message,
							timestamp: new Date(timestamp).toLocaleString()
						};
					}
				});

				// Go through each recipient and add it to the message array
				Object.keys(recipients).forEach(r => {
					received.push(recipients[r]);
				})

				this.received = received;
			});
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
