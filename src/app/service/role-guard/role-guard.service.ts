import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

import { UserService } from "../user/user.service";

@Injectable({
	providedIn: 'root'
})
export class RoleGuardService implements CanActivate {
	constructor(
		private userService: UserService,
		private router: Router) {
	}

	/**
	 * Verifies that the user is ALREADY authenticated so redirect them to /messages
	 * 
	 * @param next 
	 * @param state 
	 */
	canActivate(): boolean {

		// Check if the user is logged in
		if (this.userService.isAuthenticated) {
			this.router.navigate(["/messages"])
			return false;
		}

		// Redirect if they are not
		return true;
	}
}
