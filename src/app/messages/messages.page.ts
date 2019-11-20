import { Component, OnInit } from '@angular/core';

import { UserService } from "../service/user/user.service";
import { MessagesService } from "../service/messages/messages.service";

@Component({
	selector: 'app-messages',
	templateUrl: './messages.page.html',
	styleUrls: ['./messages.page.scss'],
})
export class MessagesPage implements OnInit {
	private isDarkMode: boolean;
	private chats: Array<any>;

	constructor(
		private messageService: MessagesService,
		private userService: UserService) {
	}

	ngOnInit() {
		// Check if the user toggled dark mode last time, if so keep that and remember it
		this.isDarkMode = localStorage.getItem("dark") === null || localStorage.getItem("dark") === "false" ? false : true;
		this.toggleDarkMode();

		// Get all chats that the user has from firestore via realtime
		this.chats = [];
		const username = this.userService.username;
		const ref = this.messageService.ref;

		ref.where("sender", "==", username).onSnapshot(querySnapshot => {
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
		})
	}

	/**
	 * 
	 * @param contact 
	 */
	openChat(contact) {
	}

	/**
	 * Calls the user service to log out the user and redirect to login
	 */
	doLogout() {
		this.userService.logout();
		window.location.reload();
	}

	/**
	 * Toggle dark mode for the applicaton
	 * 
	 * https://ionicframework.com/docs/theming/dark-mode
	 */
	toggleDarkMode() {
		// Check if the user previously selected the dark mode toggle
		if (this.isDarkMode) {
			document.body.classList.toggle('dark', true);
		}

		// Query for the toggle that is used to change between themes
		const toggle: any = document.querySelector('#themeToggle');

		// Listen for the toggle check/uncheck to toggle the dark class on the <body>
		toggle.addEventListener('ionChange', (ev: any) => {
			document.body.classList.toggle('dark', ev.detail.checked);

			// Adjust localStorage on toggle
			if (localStorage.getItem("dark") === "true") {
				localStorage.setItem("dark", "false");
			} else {
				localStorage.setItem("dark", "true");
			}
		});

		const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

		// Listen for changes to the prefers-color-scheme media query
		prefersDark.addListener((e) => checkToggle(e.matches));

		// Called when the app loads
		function loadApp() {
			checkToggle(prefersDark.matches);
		}

		// Called by the media query to check/uncheck the toggle
		function checkToggle(shouldCheck) {
			toggle.checked = shouldCheck;
		}
	}
}
