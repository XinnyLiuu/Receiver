import { Injectable } from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class DarkModeService {
	public isDarkMode: boolean;

	constructor() {
		this.isDarkMode = false;

		// Check if the user toggled dark mode last time, if so turn on dark mode
		if (localStorage.getItem("dark") !== null || localStorage.getItem("dark") !== "false") {
			this.isDarkMode = true;
		}

		if (this.isDarkMode) {
			document.body.classList.toggle('dark', true);
		}
	}

	/**
	 * Toggle dark mode for the applicaton
	 * 
	 * https://ionicframework.com/docs/theming/dark-mode
	 */
	toggleDarkMode(toggle) {
		// Listen for the toggle check/uncheck to toggle the dark class on the <body>
		toggle.addEventListener('ionChange', (ev: any) => {
			document.body.classList.toggle('dark', ev.detail.checked);

			// Adjust localStorage on toggle
			if (localStorage.getItem("dark") === "true") {
				localStorage.setItem("dark", "false");
			} else {
				localStorage.setItem("dark", "true");
			}
		});

		const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

		// Listen for changes to the prefers-color-scheme media query
		prefersDark.addListener((e) => checkToggle(e.matches));

		// Called when the app loads
		function loadApp() {
			checkToggle(prefersDark.matches);
		}

		// Called by the media query to check/uncheck the toggle
		function checkToggle(shouldCheck) {
			toggle.checked = shouldCheck;
		}
	}
}
