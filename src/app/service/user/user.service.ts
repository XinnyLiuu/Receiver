import { Injectable } from '@angular/core';

import { FirebaseService } from '../firebase/firebase.service';

@Injectable({
	providedIn: 'root'
})
export class UserService {
	private db; // firebase
	private ref; // firebase collection reference
	private isAuthenticated: boolean;
	private username: string;
	private fullName: string;

	constructor(private firebaseService: FirebaseService) {
		this.db = this.firebaseService.db;
		this.ref = this.db.collection("users");

		if (localStorage.getItem("isAuth") === null) this.isAuthenticated = false;
		else this.isAuthenticated = true;

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
		const { fname, lname, username, password, salt } = userData;

		try {
			const result = await this.ref.doc(username).set({
				username: username,
				fname: fname,
				lname: lname,
				password: password,
				salt: salt
			});

			return true;
		} catch (err) {
			return false;
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
}
