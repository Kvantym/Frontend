import 'zone.js/node';
import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { importProvidersFrom } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, provideHttpClient } from '@angular/common/http';
import { provideServerRendering } from '@angular/platform-server';
import type { BootstrapContext } from '@angular/platform-browser';

export async function renderApp(context: BootstrapContext) {
  return bootstrapApplication(App, {
    providers: [
      provideRouter(routes),
      importProvidersFrom(ReactiveFormsModule, HttpClientModule),
      provideServerRendering(),
      provideHttpClient(),
    ],
  }, context);
}

export default renderApp;
