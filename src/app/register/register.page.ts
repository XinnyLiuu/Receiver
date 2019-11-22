import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from "@angular/forms";
import { Router } from "@angular/router";

import { UserService } from "../service/user/user.service";
import { CryptoService } from "../service/crypto/crypto.service";
import { DarkModeService } from '../service/dark-mode/dark-mode.service';

@Component({
	selector: 'app-register',
	templateUrl: './register.page.html',
	styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
	private registerForm: FormGroup;
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
		this.registerForm = this.formBuilder.group({
			fname: "",
			lname: "",
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
	 * Registers the user
	 * 
	 * @param userData form data
	 */
	async register(userData) {
		try {
			// Grab values
			let { fname, lname, username, password } = userData;

			// Capitalize first + last name
			fname.charAt(0).toUpperCase();
			lname.charAt(0).toUpperCase();

			const exists = await this.userService.isUserExists(username.trim().toLowerCase());

			// If the user does not exist then add the user to db
			if (!exists) {
				// Hash the password
				const salt = this.cryptoService.getSalt();
				password = this.cryptoService.hash(password, salt);

				// Setup user
				userData.username = username.trim().toLowerCase();
				userData.fname = fname.trim();
				userData.lname = lname.trim();
				userData.salt = salt;
				userData.password = password;

				const added = await this.userService.addUser(userData);

				if (added) {
					// Set user data 
					this.userService.prepareUser(userData.fname, userData.lname, userData.username);

					// Navigate to /messages and force a reload there for firebase to fetch the required documents
					return this.router.navigate(["/messages"])
						.then(() => window.location.reload());
				}
			}

			this.error = true;
		} catch (err) {
			this.error = true;
		}
	}

	/**
	 * Redirect user to login
	 */
	toLogin() {
		return this.router.navigate(["/login"]);
	}
}
