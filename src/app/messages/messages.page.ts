import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";

import { UserService } from "../service/user/user.service";
import { MessagesService } from "../service/messages/messages.service";
import { DarkModeService } from "../service/dark-mode/dark-mode.service";
import { Observable, combineLatest } from 'rxjs';

@Component({
	selector: 'app-messages',
	templateUrl: './messages.page.html',
	styleUrls: ['./messages.page.scss'],
})
export class MessagesPage implements OnInit {
	private messages: Array<any>;
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
		this.username = this.userService.getUsername();
		this.fullName = this.userService.getFullName();
		this.messages = [];
		this.getMessages();

		// Dark Mode
		this.darkModeService.init();
		this.isDarkMode = this.darkModeService.getIsDarkMode();
	}

	/**
	 * Get all the messages that the current user sent
	 */
	getSentMessages() {
		return Observable.create(subscriber => {
			this.messageService.getRef()
				.where("sender", "==", this.username)
				.onSnapshot(querySnapshot => {
					// let sent = [];
					let data = [];

					// Gather the documents
					querySnapshot.forEach(doc => {
						data.push(doc.data());
					});

					subscriber.next(data);
				})
		})
	}

	/**
	 * Get all the message that the current user received
	 */
	getReceivedMessages() {
		return Observable.create(subscriber => {
			this.messageService.getRef()
				.where("recipient", "==", this.username)
				.onSnapshot(querySnapshot => {
					let data = [];

					// Gather the documents
					querySnapshot.forEach(doc => {
						data.push(doc.data());
					});

					subscriber.next(data);
				})
		});
	}

	/**
	 * Combine the messages received and sent to load all messages for the user
	 */
	getMessages() {
		// Combine the two observables and parse the data to create a single latest message for the current user
		combineLatest(this.getReceivedMessages(), this.getSentMessages(), (received: any[], sent: any[]) => ({ received, sent }))
			.subscribe(pair => {
				const received = pair.received;
				const sent = pair.sent;

				// Build a map to keep track of individual contacts and their list of messages
				const contacts = new Map();

				received.forEach(m => {
					const contact = m.sender;
					const message = m.message;
					const timestamp = m.timestamp;

					if (contacts.get(contact) !== undefined) {
						contacts.get(contact).push({
							message: message,
							timestamp: timestamp,
							myself: false
						});
					} else {
						contacts.set(contact, [{
							message: message,
							timestamp: timestamp,
							myself: false
						}])
					}
				});

				sent.forEach(m => {
					const contact = m.recipient;
					const message = m.message;
					const timestamp = m.timestamp;

					if (contacts.get(contact) !== undefined) {
						contacts.get(contact).push({
							message: message,
							timestamp: timestamp,
							myself: true
						});
					} else {
						contacts.set(contact, [{
							message: message,
							timestamp: timestamp,
							myself: true
						}])
					}
				});

				// Iterate through each contact in the map to get the latest message
				let allMessages = [];
				contacts.forEach((value, key) => {
					const messages = value;
					if (messages.length > 0) messages.sort((a, b) => a.timestamp > b.timestamp ? -1 : 1); // Sort the messages in descending order

					// Cleanup the latest message and add it to the allMessages array
					const latest = messages[0];
					latest.timestamp = new Date(latest.timestamp).toLocaleString();
					latest.contact = key;
					allMessages.push(latest);
				});

				this.messages = allMessages;
			})
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
