import { Injectable } from '@angular/core';
import * as firebase from "firebase/app";
import "firebase/firestore";
import "firebase/analytics";

@Injectable({
	providedIn: 'root'
})
export class FirebaseService {
	public db: any;

	constructor() {
		// Config for Firebase
		const firebaseConfig = {
			apiKey: "AIzaSyA4EsNpQHKXWdAIBl4ij_zAKPl7AHNpqFA",
			authDomain: "ionic-b8a52.firebaseapp.com",
			databaseURL: "https://ionic-b8a52.firebaseio.com",
			projectId: "ionic-b8a52",
			storageBucket: "ionic-b8a52.appspot.com",
			messagingSenderId: "986104231188",
			appId: "1:986104231188:web:ce7978df4bf85b3acbbe01",
			measurementId: "G-YMSZ965LM7"
		};

		// Initialize Firebase
		firebase.initializeApp(firebaseConfig);
		// firebase.analytics();

		this.db = firebase.firestore();

		console.log(this.db);
	}
}
