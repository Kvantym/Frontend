import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { importProvidersFrom } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, provideHttpClient, withInterceptors } from '@angular/common/http';
import { AuthInterceptor } from './app/services/auth.interceptor';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { boardReducer } from './app/board/boardNgRx/board.reducer';
import { BoardEffects } from './app/board/boardNgRx/board.effects';
import { cartListReducer } from './app/cartList/cartListNgRx/cartList.reducer';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { CartListEffects } from './app/cartList/cartListNgRx/cartList.effects';

bootstrapApplication(App, {
  providers: [
    provideRouter(routes),
    importProvidersFrom(HttpClientModule, ReactiveFormsModule),
    provideHttpClient(withInterceptors([AuthInterceptor])),
    provideStore({ board: boardReducer, cartList: cartListReducer }),
    provideEffects([BoardEffects, CartListEffects]),
    importProvidersFrom(StoreDevtoolsModule.instrument({ maxAge: 25 })),
  ],
}).catch(err => console.error(err));
