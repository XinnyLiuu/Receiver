import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

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
	 * 
	 * @param next 
	 * @param state 
	 */
	canActivate(): boolean {
		// Check if the user is logged in
		if (this.userService.isAuthenticated) return true;

		// Redirect if they are not
		this.router.navigate(["/login"]);
		return false;
	}
}
