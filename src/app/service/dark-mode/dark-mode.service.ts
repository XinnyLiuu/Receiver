import { Injectable } from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class DarkModeService {
	private isDarkMode: boolean;

	constructor() {
	}

	init() {
		this.isDarkMode = true; // Default to true
		this.toggleDarkMode();
		document.body.classList.toggle('dark', this.isDarkMode);
	}

	getIsDarkMode() {
		return this.isDarkMode;
	}

	toggleDarkMode() {
		// Check if the user toggled dark mode last time, if so turn on dark mode
		if (localStorage.getItem("dark") === "true") this.isDarkMode = true;

		// Query for the toggle that is used to change between themes
		const toggle: any = document.querySelector('#themeToggle');

		// Listen for the toggle check/uncheck to toggle the dark class on the <body>
		toggle.addEventListener('ionChange', (ev: any) => {
			document.body.classList.toggle('dark', ev.detail.checked);

			localStorage.setItem("dark", ev.detail.checked);
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
