import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from "@angular/forms";
import { ActivatedRoute, Router } from '@angular/router';

import { UserService } from "../service/user/user.service";
import { MessagesService } from "../service/messages/messages.service";
import { DarkModeService } from "../service/dark-mode/dark-mode.service";

@Component({
	selector: 'app-chat',
	templateUrl: './chat.page.html',
	styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {
	private messageForm: FormGroup;
	private contact: string;
	private isDarkMode: boolean;
	private messages: Array<any>;
	private error: boolean;

	constructor(
		private formBuilder: FormBuilder,
		private router: Router,
		private route: ActivatedRoute,
		private darkModeService: DarkModeService,
		private messageService: MessagesService,
		private userService: UserService) {
	}

	ngOnInit() {
		// Check the param passed into the url for this component
		this.route.paramMap.subscribe(async params => {
			try {
				// Get the contact from the route
				const contact = params.get("contact");
				this.contact = contact;

				// Check if the user exists
				const exists = await this.userService.isUserExists(contact);

				if (!exists) return this.router.navigate(["/messages"]);
			} catch (err) {
				return this.router.navigate(["/messages"]);
			}
		});

		// Get all messages the current user has with all the contact
		this.messages = [];
		const username = this.userService.username;
		const ref = this.messageService.ref;

		ref.where("sender", "==", username)
			.where("recipient", "==", this.contact)
			.onSnapshot(querySnapshot => {
				let allMessages = [];

				let sent = [];
				querySnapshot.forEach(doc => {
					sent.push({
						sender: doc.data().sender,
						text: doc.data().message,
						timestamp: doc.data().timestamp,
						sent: true
					})
				});

				ref.where("sender", "==", this.contact)
					.where("recipient", "==", username)
					.onSnapshot(querySnapshot => {

						let received = [];
						querySnapshot.forEach(doc => {
							received.push({
								sender: doc.data().sender,
								text: doc.data().message,
								timestamp: doc.data().timestamp,
								sent: false
							})
						});

						sent.forEach(s => {
							allMessages.push(s);
						});

						received.forEach(r => { 
							allMessages.push(r);
						});

						allMessages.sort((a, b) => (a.timestamp >= b.timestamp) ? 1 : -1);
						this.messages = allMessages;
					})
			});

		// Prepare the messaging form
		this.messageForm = this.formBuilder.group({
			message: ""
		});

		// Dark Mode
		const toggle: any = document.querySelector('#themeToggle');
		this.isDarkMode = this.darkModeService.isDarkMode;
		this.darkModeService.toggleDarkMode(toggle);

		// Default error to false
		this.error = false;
	}

	/**
	 * Sends a message to the contact
	 * 
	 * @param messageData 
	 */
	async sendMessage(messageData) {
		try {
			let { message } = messageData; // TODO: encryption of message
			const username = this.userService.username;

			const success = await this.messageService.createMessage(username, this.contact, message);

			if (!success) {
				this.error = true;
			}
		} catch (err) {
			this.error = true;
		}
	}
}
