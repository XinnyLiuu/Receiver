import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from "@angular/forms";
import { Router } from '@angular/router';

import { UserService } from "../service/user/user.service";

@Component({
	selector: 'app-settings',
	templateUrl: './settings.page.html',
	styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {
	private settingsForm: FormGroup;
	private error: boolean;
	private errorMessage: string;

	constructor(
		private router: Router,
		private userService: UserService,
		private formBuilder: FormBuilder) { }

	ngOnInit() {
		// Prepare form
		this.settingsForm = this.formBuilder.group({
			username: this.userService.getUsername(),
			firstname: this.userService.getFullName().split(" ")[0],
			lastname: this.userService.getFullName().split(" ")[1],
			password: ""
		});

		// Set dark mode (if any)
		if (localStorage.getItem("dark") === "true") document.body.classList.toggle('dark', true);

		// Default error
		this.error = false;
		this.errorMessage = "An error has occured!";
	}

	/**
	 * Updates the user's information on firebase
	 */
	async updateSettings(formData) {
		try {
			const updated = await this.userService.updateUser(formData);

			if (updated) {
				// Redirect to messages
				return this.router.navigate(['/messages'])
					.then(() => window.location.reload());
			}

			this.error = true;
			this.errorMessage = "Error updating your settings!";
		} catch (err) {
			this.error = true;
			this.errorMessage = "Error updating your settings!";
		}
	}
}
