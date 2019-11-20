import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from './service/auth-guard/auth-guard.service';

const routes: Routes = [
	{
		path: '', redirectTo: 'register', pathMatch: 'full'
	},
	{
		path: 'login',
		loadChildren: () => import('./login/login.module').then(m => m.LoginPageModule)
	},
	{
		path: 'register',
		loadChildren: () => import('./register/register.module').then(m => m.RegisterPageModule)
	},
	{
		path: 'messages',
		canActivate: [AuthGuardService],
		loadChildren: () => import('./messages/messages.module').then(m => m.MessagesPageModule)
	},
];

@NgModule({
	imports: [
		RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
	],
	exports: [RouterModule]
})
export class AppRoutingModule { }
