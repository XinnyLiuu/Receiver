import { Component, OnInit } from '@angular/core';
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
	private contact: string;
	private isDarkMode: boolean;
	private messages: Array<any>;

	constructor(
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
				let msgs = [];

				querySnapshot.forEach(doc => {
					msgs.push({
						text: doc.data().text,
						timestamp: doc.data().timestamp
					})
				})

				this.messages = msgs;
			});

		// Dark Mode
		const toggle: any = document.querySelector('#themeToggle');
		this.isDarkMode = this.darkModeService.isDarkMode;
		this.darkModeService.toggleDarkMode(toggle);
	}
}
