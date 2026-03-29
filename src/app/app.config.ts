import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { providePrimeNG } from 'primeng/config';
import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';
import { provideStore } from '@ngrx/store';

import { routes } from './app.routes';
import { headerInterceptor } from './modules/core/interceptors/header/header-interceptor';
import { errorInterceptor } from './modules/core/interceptors/error/error-interceptor';
import { loaderInterceptor } from './modules/core/interceptors/loader/loader-interceptor';
import { appReducer } from './store';

const Noir = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{zinc.50}',
      100: '{zinc.100}',
      200: '{zinc.200}',
      300: '{zinc.300}',
      400: '{zinc.400}',
      500: '{zinc.500}',
      600: '{zinc.600}',
      700: '{zinc.700}',
      800: '{zinc.800}',
      900: '{zinc.900}',
      950: '{zinc.950}',
    },
    surface: {
      0: '{zinc.0}',
      50: '{zinc.50}',
      100: '{zinc.100}',
      200: '{zinc.200}',
      300: '{zinc.300}',
      400: '{zinc.400}',
      500: '{zinc.500}',
      600: '{zinc.600}',
      700: '{zinc.700}',
      800: '{zinc.800}',
      900: '{zinc.900}',
      950: '{zinc.950}',
    },
    colorScheme: {
      light: {
        primary: {
          color: '{zinc.900}',
          inverseColor: '{zinc.50}',
          hoverColor: '{zinc.800}',
          activeColor: '{zinc.700}',
        },
        highlight: {
          background: '{zinc.900}',
          focusBackground: '{zinc.700}',
          color: '{zinc.50}',
          focusColor: '{zinc.50}',
        },
      },
      dark: {
        primary: {
          color: '{zinc.400}',
          inverseColor: '{zinc.800}',
          hoverColor: '{zinc.300}',
          activeColor: '{zinc.500}',
        },
        highlight: {
          background: 'rgba(161, 161, 170, .08)',
          focusBackground: 'rgba(161, 161, 170, .12)',
          color: 'rgba(244, 244, 245, .75)',
          focusColor: 'rgba(244, 244, 245, .85)',
        },
      },
    },
  },
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([loaderInterceptor, errorInterceptor, headerInterceptor])),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideAnimationsAsync(),
    MessageService,
    DialogService,
    ConfirmationService,
    providePrimeNG({
      theme: {
        preset: Noir,
        options: {
          darkModeSelector: '.app-dark',
        },
      },
    }),
    provideStore(appReducer),
  ],
};
