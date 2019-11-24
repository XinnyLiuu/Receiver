import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

import { AuthGuardService } from './service/auth-guard/auth-guard.service';
import { RoleGuardService } from "./service/role-guard/role-guard.service";

const routes: Routes = [
	{
		path: '', redirectTo: 'login', pathMatch: 'full'
	},
	{
		path: 'login',
		canActivate: [RoleGuardService],
		loadChildren: () => import('./login/login.module').then(m => m.LoginPageModule)
	},
	{
		path: 'register',
		canActivate: [RoleGuardService],
		loadChildren: () => import('./register/register.module').then(m => m.RegisterPageModule)
	},
	{
		path: 'messages',
		canActivate: [AuthGuardService],
		loadChildren: () => import('./messages/messages.module').then(m => m.MessagesPageModule)
	},
	{
		path: 'chat/:contact',
		loadChildren: () => import('./chat/chat.module').then(m => m.ChatPageModule)
	}
];

@NgModule({
	imports: [
		RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
	],
	exports: [RouterModule]
})
export class AppRoutingModule { }
