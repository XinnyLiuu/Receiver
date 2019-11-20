import { Injectable } from '@angular/core';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable({
	providedIn: 'root'
})
export class UserService extends FirebaseService {
	private ref; // firebase url
	public userData; // Object containing user data
	public isAuthenticated: boolean; // Flag for whether or not the user has been authenticated

	constructor() {
		super();
		this.ref = this.db.collection("users");
		this.userData = {};
		this.isAuthenticated = localStorage.getItem("isAuth") === null ? false : true;
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
			const querySnapshot = await this.ref.where("username", "==", username).where("password", "==", password).get();

			const userData = querySnapshot[0].data();
			return userData;
		} catch (err) {
			return null;
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
			return null;
		}
	}

	/**
	 * Prepares the user data object
	 * 
	 * @param userData 
	 */
	prepareUser(userData) {
		this.userData = userData;
		this.isAuthenticated = true;

		// Keep the user logged in via localStorage
		localStorage.setItem("isAuth", "true");
	}
}
