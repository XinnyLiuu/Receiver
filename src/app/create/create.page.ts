import { Component, OnInit } from '@angular/core';
import { UserService } from '../service/user/user.service';
import { Router } from '@angular/router';

@Component({
	selector: 'app-create',
	templateUrl: './create.page.html',
	styleUrls: ['./create.page.scss'],
})
export class CreatePage implements OnInit {
	private users: any[];
	private error: boolean;
	private searchTerm: string;

	constructor(
		private router: Router,
		private userService: UserService) { }

	ngOnInit() {
		// Set dark mode (if any)
		if (localStorage.getItem("dark") === "true") document.body.classList.toggle('dark', true);

		// Get list of users
		this.users = [];
		this.getUsers();

		// Default error 
		this.error = false;
	}

	/**
	 * Gets the list of all users
	 */
	async getUsers() {
		try {
			this.users = await this.userService.getAllUsers();
		} catch (err) {
			this.error = true;
		}
	}

	/**
	 * Opens the chat with the point of contact
	 * 
	 * @param contact 
	 */
	openChat(contact) {
		return this.router.navigate(['/chat', contact]);
	}

	/**
	 * Based on the text inputted through the search bar, filter through the list of users
	 */
	async filterUsers() {
		await this.getUsers();

		// Filter the user for usernames and fullnames that due not match the search term
		this.users = this.users.filter(user => {
			return user.username.indexOf(this.searchTerm.toLowerCase()) > -1 || user.fullname.toLowerCase().indexOf(this.searchTerm.toLowerCase()) > -1;
		});
	}
}
