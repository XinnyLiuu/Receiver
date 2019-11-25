import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { DomSanitizer } from '@angular/platform-browser';
import { LoadingController, AlertController } from "@ionic/angular";
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';

import { UserService } from "../service/user/user.service";
import { MessagesService } from "../service/messages/messages.service";
import { DarkModeService } from "../service/dark-mode/dark-mode.service";

import { Observable, combineLatest } from 'rxjs';
import { all } from 'q';

@Component({
	selector: 'app-messages',
	templateUrl: './messages.page.html',
	styleUrls: ['./messages.page.scss'],
})
export class MessagesPage implements OnInit {
	private lastNotifiedMessage: string;
	private messages: Array<any>;
	private isDarkMode: boolean;
	private username: string;
	private fullName: string;
	private error: boolean;
	private errorMessage: string;

	constructor(
		private alertController: AlertController,
		private localNotifications: LocalNotifications,
		private loadingController: LoadingController,
		private domSanitizer: DomSanitizer,
		private router: Router,
		private darkModeService: DarkModeService,
		private messageService: MessagesService,
		private userService: UserService) {
	}

	ngOnInit() {
		// Present loading spinner until messages are ready 
		this.showSpinner();

		// Get all the messages where the current user is involved
		this.username = this.userService.getUsername();
		this.fullName = this.userService.getFullName();
		this.messages = [];
		this.getMessages();

		this.lastNotifiedMessage = "";

		// Dark Mode
		this.darkModeService.init();
		this.isDarkMode = this.darkModeService.getIsDarkMode();

		// Default error
		this.error = false;
		this.errorMessage = "An error has occurred!";
	}

	/**
	 * Shows the loading spinner until messages are ready
	 */
	async showSpinner() {
		const loading = await this.loadingController.create({
			spinner: "crescent",
			duration: 100
		});

		return await loading.present();
	}

	/**
	 * Get all the messages that the current user sent
	 */
	getSentMessages() {
		return Observable.create(subscriber => {
			this.messageService.getRef()
				.where("sender", "==", this.username)
				.onSnapshot(querySnapshot => {
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
		const sentMessages$: Observable<any> = this.getSentMessages();
		const receivedMessages$: Observable<any> = this.getReceivedMessages();

		// Combine the two observables and parse the data to create a single latest message for the current user
		combineLatest(receivedMessages$, sentMessages$, (received: any[], sent: any[]) => ({ received, sent }))
			.subscribe(async pair => {
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
				contacts.forEach(async (value, key) => {
					const messages = value;

					// Sort the messages in descending order
					if (messages.length > 0) messages.sort((a, b) => a.timestamp > b.timestamp ? -1 : 1);

					// Cleanup the latest message and add it to the allMessages array
					const latest = messages[0];
					latest.timestamp = new Date(latest.timestamp).toLocaleString();
					latest.contact = key;

					// Check if the latest message received is not from the contact and send a notification 
					if (!latest.myself &&
						key !== this.username &&
						latest.message !== this.lastNotifiedMessage) {

						// https://github.com/katzer/cordova-plugin-local-notifications/issues/1681
						this.localNotifications.schedule({
							title: `${key}`,
							text: `${latest.message}`,
							smallIcon: "res://n_icon.png",
							color: "#e0b500"
						});

						// Set the notified message as the last notified message so that the user won't get notified again
						this.lastNotifiedMessage = latest.message;
					}

					// Prepare the latest message with the user's icon and fullname
					try {
						// Get the svg string and convert it to base64 to load into the DOM as an image src
						const src = await this.userService.getUserIcon(key);
						latest.icon = src;

						// Get the full name
						const fullname = await this.userService.getUserFullName(key);
						latest.fullname = fullname;
					} catch (err) {
						this.error = true;
						this.errorMessage = "Error with getting conversations!";
					}

					allMessages.push(latest);
				});

				this.messages = allMessages;
			})
	}

	/**
	 * Deletes the conversation between the current user and the contact
	 * 
	 * @param contact 
	 */
	async deleteConversation(contact: string) {
		try {
			const alert = await this.alertController.create({
				header: "Delete Conversation",
				message: "This action cannot be undone",
				buttons: [
					{
						text: "Ok",
						handler: async () => {
							try {
								// Remove all messages where the sender is the user and contact AND where the recipient is the user and contact
								let querySnapshot = await this.messageService.getRef()
									.where("sender", "==", this.username)
									.where("recipient", "==", contact)
									.get();

								querySnapshot.forEach(doc => {
									doc.ref.delete();
								});

								querySnapshot = await this.messageService.getRef()
									.where("sender", "==", contact)
									.where("recipient", "==", this.username)
									.get();

								querySnapshot.forEach(doc => {
									doc.ref.delete();
								})
							} catch (err) {
								throw new Error(err);
							}
						}
					},
					{
						text: "Cancel",
						role: "cancel"
					}
				]
			});

			await alert.present();
		} catch (err) {
			this.error = true;
			this.errorMessage = "Error removing the conversation!";
		}
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
		return window.location.reload();
	}

	/**
	 * Redirects the user to create a new chat
	 */
	toCreate() {
		return this.router.navigate(['/create']);
	}

	/**
	 * Redirects the user to the settings page 
	 */
	toSettings() {
		return this.router.navigate(['/settings']);
	}
}
