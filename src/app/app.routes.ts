import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { DashboardComponent } from './dashboard/dashboard.commponent';
import { RegisterComponent } from './auth/register/register.component';
import { CreateBoardComponent } from './board/createBoard/createboard.component';
import { ShowBoardComponent } from './board/showboard/showboard.component';
import { UpdateUserComponent } from './auth/profil/profil.component';
import {MainLayoutComponent} from './main-layout-component/main-layout-component';
import {BoardArchive} from './board/board-archive/board-archive';
import {CartListArchive} from './cartList/cart-list-archive/cart-list-archive';
import {CartArchive} from './cart/cart-archive/cart-archive';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent },


  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: 'create-board', component: CreateBoardComponent },
      { path: 'boards/:id', component: ShowBoardComponent },
      { path: 'profil', component: UpdateUserComponent },
      {path: 'archive', component: BoardArchive},
      { path: 'archive-cart-list/:id', component: CartListArchive },
      {path: 'archive-cart/:id', component: CartArchive }
    ]
  },

    { path: '**', redirectTo: 'login' },
];


