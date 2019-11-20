import { Injectable } from '@angular/core';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable({
	providedIn: 'root'
})
export class UserService {
	private db; // firebase
	private ref; // firebase collection reference
	public isAuthenticated: boolean;
	public username: string;

	constructor(private firebaseService: FirebaseService) {
		this.db = this.firebaseService.db;
		this.ref = this.db.collection("users");
		this.isAuthenticated = localStorage.getItem("isAuth") === null ? false : true;
		this.username = localStorage.getItem("username");
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
			const querySnapshot = await this.ref.where("username", "==", username).where("password", "==", password).get();

			const userData = {
				fname: querySnapshot[0].data().fname,
				lname: querySnapshot[0].data().lname,
				username: querySnapshot[0].data().username
			}

			return userData;
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
	prepareUser(username: string) {
		this.isAuthenticated = true;

		localStorage.setItem("isAuth", "true");
		localStorage.setItem("username", username);
	}

	// TODO: Logout
}
