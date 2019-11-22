import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

import { UserService } from "../user/user.service";

@Injectable({
	providedIn: 'root'
})
export class AuthGuardService implements CanActivate {
	constructor(
		private userService: UserService,
		private router: Router) {
	}

	/**
	 * Verifies that the user is authenticated otherwise the route will redirect to /login
	 */
	canActivate(): boolean {
		// Check if the user is logged in
		if (this.userService.getIsAuthenticated()) return true;

		// Redirect if they are not
		this.router.navigate(["/login"]);
		return false;
	}
}
