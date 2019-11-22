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
	private isDarkMode: boolean;

	constructor(
		private darkModeService: DarkModeService,
		private cryptoService: CryptoService,
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

			// Check if user exists
			const exists = await this.userService.isUserExists(username);

			// If the user exists, prepare their data in userService and redirect them to the messages component
			if (exists) {
				// Get the user's salt 
				const salt = await this.userService.getUserSalt(username);

				// Hash the password
				password = this.cryptoService.hash(password, salt);

				// Get the user's data
				const data = await this.userService.getUserByUsernamePassword(username, password);

				// Prepare the user's session
				this.userService.prepareUser(data.fname, data.lname, data.username);

				// Navigate to /messages and force a reload there for firebase to fetch the required documents
				return this.router.navigate(["/messages"])
					.then(() => window.location.reload());
			}

			this.error = true;
		} catch (err) {
			this.error = true;
		}
	}

	/**
	 * Redirects to register page
	 */
	toRegister() {
		return this.router.navigate(["/register"]);
	}
}
