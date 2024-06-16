import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { tokenHttpInterceptor } from './auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes),importProvidersFrom(BrowserAnimationsModule), provideClientHydration(), provideHttpClient(withFetch(),withInterceptors([tokenHttpInterceptor]))],
};
