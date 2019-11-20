import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from "@angular/forms";
import { Router } from "@angular/router";

import { UserService } from "../service/user/user.service";
import { CryptoService } from "../service/crypto/crypto.service";

@Component({
	selector: 'app-login',
	templateUrl: './login.page.html',
	styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
	private loginForm: FormGroup;
	private error: boolean;

	constructor(
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

				if (salt !== null || salt !== undefined) {
					password = this.cryptoService.hash(password, salt);

					// Check if the user with the hash and username exists
					const userData = await this.userService.getUserByUsernamePassword(username, password);

					if (userData !== null || userData !== undefined) {
						this.userService.prepareUser(userData);

						return this.router.navigate(["/messages"]);
					}
				}
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
