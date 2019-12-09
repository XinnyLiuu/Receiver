import { Injectable } from '@angular/core';

import * as jdenticon from "jdenticon";

import { FirebaseService } from '../firebase/firebase.service';
import { CryptoService } from '../crypto/crypto.service';

@Injectable({
	providedIn: 'root'
})
export class UserService {
	private db; // firebase
	private ref; // firebase collection reference
	private isAuthenticated: boolean;
	private username: string;
	private fullName: string;

	constructor(
		private cryptoService: CryptoService,
		private firebaseService: FirebaseService) {
		// Firestore references
		this.db = this.firebaseService.db;
		this.ref = this.db.collection("users");

		// Set auth
		if (localStorage.getItem("isAuth") === null) this.isAuthenticated = false;
		else this.isAuthenticated = true;

		// Set current user's info
		this.username = localStorage.getItem("username");
		this.fullName = localStorage.getItem("fullName");
	}

	/**
	 * Returns isAuthenticated
	 */
	getIsAuthenticated() {
		return this.isAuthenticated;
	}

	/**
	 * Returns username
	 */
	getUsername() {
		return this.username;
	}

	/**
	 * Returns full name
	 */
	getFullName() {
		return this.fullName;
	}

	/**
	 * Add a user to the Users collection
	 */
	async addUser(userData: any): Promise<boolean> {
		try {
			// Get values from form data
			let { fname, lname, username, password } = userData;
			fname = fname.trim().toLowerCase();
			lname = lname.trim().toLowerCase();
			username = username.trim().toLowerCase();
			password = password.trim();

			// Check if there are spaces in the username
			if (username.indexOf(" ") >= 0) return false;

			// Capitalize first + last name
			fname = fname.charAt(0).toUpperCase() + fname.slice(1);
			lname = lname.charAt(0).toUpperCase() + lname.slice(1);

			// Check if the username already exists
			const exists = await this.isUserExists(username);

			if (!exists) {
				// Hash the password
				const salt = this.cryptoService.getSalt();
				password = this.cryptoService.hash(password, salt);

				// Create a icon for this user via jdenticon https://jdenticon.com/
				const svgString = jdenticon.toSvg(username, 100);

				// Add the user to firebase
				await this.ref.doc(username).set({
					username: username,
					fname: fname,
					lname: lname,
					password: password,
					salt: salt,
					icon: svgString
				});

				// Prepare the user data
				this.prepareUser(fname, lname, username);

				return true;
			}

			return false;
		} catch (err) {
			throw new Error(err);
		}
	}

	/**
	 * Checks if the user exists and then prepare the user's session
	 * 
	 * @param userData 
	 */
	async loginUser(userData: any): Promise<boolean> {
		try {
			// Grab values from object
			let { username, password } = userData;

			username = username.trim().toLowerCase();
			password = password.trim();

			// Check if the user exists
			const exists = await this.isUserExists(username);

			// If the user exists, prepare their data
			if (exists) {
				// Get the user's salt
				const salt = await this.getUserSalt(username);

				// Hash the password
				password = this.cryptoService.hash(password, salt);

				// Get the user's data
				const data = await this.getUserByUsernamePassword(username, password);

				// Prepare the user's session
				this.prepareUser(data.fname, data.lname, data.username);

				return true;
			}

			return false;
		} catch (err) {
			throw new Error(err);
		}
	}

	/**
	 * Updates the user's information
	 * 
	 * @param formData 
	 */
	async updateUser(formData): Promise<boolean> {
		try {
			// Get the values from the formData object
			let { firstname, lastname, password } = formData;

			console.log(lastname);

			firstname = firstname.trim().toLowerCase();
			lastname = lastname.trim().toLowerCase();
			password = password.trim();

			// Check if the username exists
			const exists = await this.isUserExists(this.getUsername());

			if (exists) {
				// Capitalize first + last name
				firstname = firstname.charAt(0).toUpperCase() + firstname.slice(1);
				lastname = lastname.charAt(0).toUpperCase() + lastname.slice(1);

				// Create new salt
				const salt = this.cryptoService.getSalt();

				// Hash password
				password = this.cryptoService.hash(password, salt);

				// Create a icon for this user via jdenticon https://jdenticon.com/
				const svgString = jdenticon.toSvg(this.getUsername(), 100);

				// Call firebase to update data
				await this.ref.doc(this.getUsername()).set({
					username: this.getUsername(),
					fname: firstname,
					lname: lastname,
					password: password,
					salt: salt,
					icon: svgString
				});

				// Prepare the user data
				this.prepareUser(firstname, lastname, this.getUsername());

				return true;
			}

			return false;
		} catch (err) {
			throw new Error(err);
		}
	}

	/**
	 * Check if the user with specified username exists 
	 * 
	 * @param username 
	 */
	async isUserExists(username: string): Promise<boolean> {
		try {
			const doc = await this.ref.doc(username).get();
			if (doc.exists) return true;

			return false;
		} catch (err) {
			return false;
		}
	}

	/**
	 * Returns the user data based on username and password
	 * 
	 * @param username 
	 * @param password 
	 */
	async getUserByUsernamePassword(username: string, password: string) {
		try {
			// Find a match in users where username and password is the same as the input
			const user = await this.ref.doc(username).get();
			const userData = user.data();

			if (userData.password === password) {
				let data = {
					username: userData.username,
					fname: userData.fname,
					lname: userData.lname
				};

				return data;
			}

			throw new Error();
		} catch (err) {
			throw new Error(err);
		}
	}

	/**
	 * Get the user's salt
	 * 
	 * @param username 
	 */
	async getUserSalt(username: string) {
		try {
			const doc = await this.ref.doc(username).get();
			const salt = doc.data().salt;

			return salt;
		} catch (err) {
			throw new Error(err);
		}
	}

	/**
	 * Get the user's icon
	 * 
	 * @param username 
	 */
	async getUserIcon(username: string) {
		try {
			const doc = await this.ref.doc(username).get();
			const icon = doc.data().icon;
			const src = `data:image/svg+xml;base64,${window.btoa(icon)}`;

			return src;
		} catch (err) {
			throw new Error(err);
		}
	}

	/**
	 * Gets the user's fullname
	 * 
	 * @param username 
	 */
	async getUserFullName(username: string) {
		try {
			const doc = await this.ref.doc(username).get();
			const fullname = `${doc.data().fname} ${doc.data().lname}`;

			return fullname;
		} catch (err) {
			throw new Error(err);
		}
	}

	/**
	 * Prepares the user data object
	 * 
	 * @param username 
	 */
	prepareUser(firstname: string, lastname: string, username: string) {
		this.isAuthenticated = true;

		localStorage.setItem("isAuth", "true");
		localStorage.setItem("username", username);
		localStorage.setItem("fullName", `${firstname} ${lastname}`);
	}

	/**
	 * Deletes the user session and go back to /login
	 */
	logout() {
		localStorage.clear();
	}

	/**
	 * Gets the list of all users in the application
	 */
	async getAllUsers() {
		try {
			const snapshot = await this.ref.get();

			let users = [];
			snapshot.forEach(doc => {
				users.push({
					username: doc.data().username,
					fullname: `${doc.data().fname} ${doc.data().lname}`
				});
			})

			return users;
		} catch (err) {
			throw new Error(err);
		}
	}
}
