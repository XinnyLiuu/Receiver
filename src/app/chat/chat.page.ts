import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from "@angular/forms";
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, ActionSheetController, ModalController } from "@ionic/angular";

import { UserService } from "../service/user/user.service";
import { MessagesService } from "../service/messages/messages.service";
import { PluginService } from '../service/plugin/plugin.service';
import { ModalComponent } from '../modal/modal.component';

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
		private modalController: ModalController,
		private pluginService: PluginService,
		private actionSheetController: ActionSheetController,
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

		// Get all messages the current user has with the contact
		this.messages = [];
		this.getChat();

		// Prepare the messaging form
		this.messageForm = this.formBuilder.group({
			message: ""
		});

		// Set dark mode (if any)
		if (localStorage.getItem("dark") === "true") document.body.classList.toggle('dark', true);

		// Default error to false
		this.error = false;
	}

	/**
	 * Gets the messages for the current chat
	 */
	getChat() {
		const username = this.userService.getUsername();
		this.messageService.getRef()
			.where("sender", "in", [username, this.contact]) // Firebase query
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
	}

	/**
	 * Sends a message to the contact
	 * 
	 * @param messageData 
	 */
	async sendMessage(messageData) {
		try {
			let { message } = messageData; // TODO: encryption of message
			const username = this.userService.getUsername();

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

	/**
	 * Opens up the plugins menu
	 * 
	 * @param ev 
	 */
	async showPlugins(ev: any) {
		try {
			const actionSheet = await this.actionSheetController.create({
				header: 'Plugins',
				buttons: [
					{
						text: 'GIPHY',
						icon: 'aperture',
						handler: () => {
							alert("Giphy!");
						}
					},
					{
						text: "Dad Jokes",
						icon: 'happy',
						handler: async () => {
							try {
								// Get dad joke
								const joke = await this.pluginService.getDadJoke();

								// Append the joke to the textarea
								this.messageForm.setValue({
									message: joke
								});
							} catch (err) {
								this.error = true;
							}
						}
					},
					{
						text: "Translate",
						icon: 'book',
						handler: async () => {
							// Open up a modal for the user to fill out to translate a desired text of their choice
							try {
								const modal = await this.modalController.create({
									component: ModalComponent
								});

								// Get the data from the modal
								modal.onDidDismiss()
									.then(async d => {
										const data = d.data;
										const lang = data.lang;
										const text = data.text;

										// Translate
										const translatedText = await this.pluginService.getTranslate(text, lang);

										// Append to form
										this.messageForm.setValue({
											message: translatedText
										});
									});

								return await modal.present();
							} catch (err) {
								this.error = true;
							}
						}
					},
					{
						text: 'Share Location',
						icon: 'pin',
						handler: () => {
							alert("Location")
						}
					}
				]
			});

			return await actionSheet.present();
		} catch (err) {
			console.log(err);
			this.error = true;
		}
	}
}
