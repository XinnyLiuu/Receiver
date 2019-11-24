import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from "@angular/forms";
import { Router } from "@angular/router";

import { UserService } from "../service/user/user.service";
import { CryptoService } from "../service/crypto/crypto.service";
import { DarkModeService } from '../service/dark-mode/dark-mode.service';

@Component({
	selector: 'app-login',
	templateUrl: './login.page.html',
	styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
	private loginForm: FormGroup;
	private error: boolean;
	private errorMessage: string;
	private isDarkMode: boolean;

	constructor(
		private darkModeService: DarkModeService,
		private userService: UserService,
		private formBuilder: FormBuilder,
		private router: Router) {
	}

	ngOnInit() {
		// Prepare the form
		this.loginForm = this.formBuilder.group({
			username: "",
			password: ""
		});

		// Dark Mode
		this.darkModeService.init();
		this.isDarkMode = this.darkModeService.getIsDarkMode();

		// Default error to false
		this.error = false;
		this.errorMessage = "An error has occured!";
	}

	/**
	 * Logs in the user 
	 * 
	 * @param userData 
	 */
	async login(userData) {
		try {
			// Grab values
			let { username, password } = userData;
			username = username.trim().toLowerCase();
			userData.username = username;

			// Login the user
			const loggedIn = await this.userService.loginUser(userData);

			if (loggedIn) {
				// Navigate to /messages and force a reload there for firebase to fetch the required documents
				return this.router.navigate(["/messages"])
					.then(() => window.location.reload());
			}

			this.error = true;
			this.errorMessage = "Could not login the user at this time. Please try again later!";
		} catch (err) {
			this.error = true;
			this.errorMessage = "Could not login the user at this time. Please try again later!";
		}
	}

	/**
	 * Redirects to register page
	 */
	toRegister() {
		return this.router.navigate(["/register"]);
	}
}
