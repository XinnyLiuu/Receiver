import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from "@angular/forms";
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent } from "@ionic/angular";

import { UserService } from "../service/user/user.service";
import { MessagesService } from "../service/messages/messages.service";

@Component({
	selector: 'app-chat',
	templateUrl: './chat.page.html',
	styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {
	private messageForm: FormGroup;
	private contact: string;
	private messages: Array<any>;
	private error: boolean;
	@ViewChild(IonContent, { static: false }) content: IonContent;

	constructor(
		private formBuilder: FormBuilder,
		private router: Router,
		private route: ActivatedRoute,
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

		ref.where("sender", "in", [username, this.contact]) // Firebase query
			.onSnapshot(querySnapshot => {
				let allMessages = [];
				let sent = [];
				let received = [];

				querySnapshot.forEach(doc => {
					if (doc.data().sender === username && doc.data().recipient === this.contact) {
						sent.push({
							sender: doc.data().sender,
							text: doc.data().message,
							timestamp: new Date(doc.data().timestamp).toLocaleString(),
							sent: true
						})
					}

					if (doc.data().sender === this.contact && doc.data().recipient === username) {
						received.push({
							sender: doc.data().sender,
							text: doc.data().message,
							timestamp: new Date(doc.data().timestamp).toLocaleString(),
							sent: false
						})
					}
				});

				sent.forEach(m => allMessages.push(m));
				received.forEach(m => allMessages.push(m));

				allMessages.sort((a, b) => a.timestamp >= b.timestamp ? 1 : -1);
				this.messages = allMessages;

				// Scroll to the bottom after messages are generated
				this.content.scrollToBottom();
			});

		// Prepare the messaging form
		this.messageForm = this.formBuilder.group({
			message: ""
		});

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

			if (!success) this.error = true;
			else {
				this.messageForm.reset();
				this.content.scrollToBottom();
			}
		} catch (err) {
			this.error = true;
		}
	}
}
