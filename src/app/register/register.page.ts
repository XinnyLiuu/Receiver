import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from "@angular/forms";
import { Router } from "@angular/router";

import { UserService } from "../service/user/user.service";

@Component({
	selector: 'app-register',
	templateUrl: './register.page.html',
	styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
	private registerForm: FormGroup;
	private error: boolean;
	private errorMessage: string;
	private isDarkMode: boolean;

	constructor(
		private userService: UserService,
		private formBuilder: FormBuilder,
		private router: Router) {
	}

	ngOnInit() {
		// Prepare the form
		this.registerForm = this.formBuilder.group({
			fname: "",
			lname: "",
			username: "",
			password: ""
		});

		// Default error to false
		this.error = false;
		this.errorMessage = "An error has occured!";
	}

	/**
	 * Registers the user
	 * 
	 * @param userData form data
	 */
	async register(userData) {
		try {
			// Pass the data to user service to handle registering the user
			const added = await this.userService.addUser(userData);

			if (added) {
				// Navigate to /messages and force a reload there for firebase to fetch the required documents
				return this.router.navigate(["/messages"])
					.then(() => window.location.reload());
			}

			this.error = true;
			this.errorMessage = "There was an error registering the user. Please try again!";
		} catch (err) {
			this.error = true;
			this.errorMessage = "There was an error registering the user. Please try again!";
		}
	}

	/**
	 * Redirect user to login
	 */
	toLogin() {
		return this.router.navigate(["/login"]);
	}
}
