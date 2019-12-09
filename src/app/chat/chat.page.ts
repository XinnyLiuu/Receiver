import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from "@angular/forms";
import { ActivatedRoute, Router } from '@angular/router';

import { IonContent, ActionSheetController, ModalController, AlertController, LoadingController } from "@ionic/angular";
import { Geolocation } from "@ionic-native/geolocation/ngx";

import { UserService } from "../service/user/user.service";
import { MessagesService } from "../service/messages/messages.service";
import { PluginService } from '../service/plugin/plugin.service';
import { ModalComponent } from '../modal/modal.component';
import { CryptoService } from '../service/crypto/crypto.service';

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
	private errorMessage: string;
	@ViewChild(IonContent, { static: false }) content: IonContent;

	constructor(
		private cryptoService: CryptoService,
		private loadingController: LoadingController,
		private geolocation: Geolocation,
		private alertController: AlertController,
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
				if (!exists) {
					this.error = true;
					this.errorMessage = "Error with loading the chat!";
					return this.router.navigate(["/messages"]);
				}
			} catch (err) {
				this.error = true;
				this.errorMessage = "Error with loading the chat!";
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
		this.errorMessage = "An error has occurred!";
	}

	/**
	 * Shows the loading spinner until messages are ready
	 */
	async showSpinner() {
		const loading = await this.loadingController.create({
			spinner: "crescent",
			duration: 200
		});

		return await loading.present();
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

				// Get the data from the query snapshot and filter
				querySnapshot.forEach(doc => {
					if (doc.data().sender === username && doc.data().recipient === this.contact) {
						sent.push({
							sender: doc.data().sender,
							text: this.cryptoService.decrypt(doc.data().message),
							timestamp: new Date(doc.data().timestamp).toLocaleString(),
							sent: true,
							giphy: doc.data().giphy
						})
					}

					if (doc.data().sender === this.contact && doc.data().recipient === username) {
						received.push({
							sender: doc.data().sender,
							text: this.cryptoService.decrypt(doc.data().message),
							timestamp: new Date(doc.data().timestamp).toLocaleString(),
							sent: false,
							giphy: doc.data().giphy
						})
					}
				});

				sent.forEach(m => allMessages.push(m));
				received.forEach(m => allMessages.push(m));

				// Sort the messages in first come first serve
				allMessages.sort((a, b) => a.timestamp >= b.timestamp ? 1 : -1);

				// Check the previous length of this.messages
				this.messages = allMessages;

				// Scroll to the bottom after messages are generated
				setTimeout(() => {
					this.content.scrollToBottom();
				}, 50);
			});
	}

	/**
	 * Sends a message to the contact
	 * 
	 * @param messageData 
	 */
	async sendMessage(messageData) {
		try {
			let { message } = messageData;
			const username = this.userService.getUsername();

			const success = await this.messageService.createMessage(username, this.contact, message);

			if (!success) {
				this.error = true;
				this.errorMessage = "Could not send the message at this time!";
			}
			else {
				this.messageForm.reset();
				this.content.scrollToBottom();
			}
		} catch (err) {
			this.error = true;
			this.errorMessage = "Could not send the message at this time!";
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
				buttons: [{
					text: 'GIPHY',
					icon: 'aperture',
					handler: async () => {
						try {
							// Show an alert that allows the user to input what gif they want to search for
							const alert = await this.alertController.create({
								header: "GIPHY",
								inputs: [
									{
										name: "term",
										type: "text",
										placeholder: "Enter a search term for a random gif"
									}
								],
								buttons: [
									{
										text: 'Submit',
										handler: async (data) => {
											// Get random GIF based on search term
											const gif = await this.pluginService.getGIF(data.term.trim());

											// Append link to textarea
											this.messageForm.setValue({
												message: gif
											});
										}
									},
									{
										text: "Cancel",
										role: 'cancel'
									}
								]
							});

							await alert.present();
						} catch (err) {
							this.error = true;
							this.errorMessage = "An error has occurred with GIPHY, please try again later!";
						}
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
							this.errorMessage = "An error has occurred with Dad Jokes, please try again later!";
						}
					}
				},
				{
					text: "Translate",
					icon: 'book',
					handler: async () => {
						try {
							// Open up a modal for the user to fill out to translate a desired text of their choice
							const modal = await this.modalController.create({
								component: ModalComponent
							});

							// Get the data from the modal
							modal.onDidDismiss()
								.then(async d => {
									const data = d.data;
									const lang = data.lang;
									const text = data.text.trim();

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
							this.errorMessage = "An error has occurred with Translate, please try again later!";
						}
					}
				},
				{
					text: 'Share Location',
					icon: 'pin',
					handler: () => {
						try {
							// Get the current geolocation of the device
							this.geolocation.getCurrentPosition()
								.then(async resp => {
									// Show spinner
									this.showSpinner();

									const address = await this.pluginService.getLocation(resp.coords.latitude, resp.coords.longitude);

									// Append the address to the textarea
									this.messageForm.setValue({
										message: address
									})
								})
						} catch (err) {
							this.error = true;
							this.errorMessage = "An error has occurred with Sharing Location, please try again later!";
						}
					}
				}]
			});

			return await actionSheet.present();
		} catch (err) {
			this.error = true;
			this.errorMessage = "Error with loading plugins at this time! Please try again later!";
		}
	}
}
