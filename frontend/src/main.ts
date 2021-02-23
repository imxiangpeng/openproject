import {OpenProjectModule} from 'core-app/angular4-modules';
import {enableProdMode} from '@angular/core';
import * as jQuery from "jquery";
import * as moment from "moment";
import {environment} from './environments/environment';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {SentryReporter} from "core-app/sentry/sentry-reporter";
import {whenDebugging} from "core-app/helpers/debug_output";
import {enableReactiveStatesLogging} from "reactivestates";

(window as any).global = window;

// Ensure we set the correct dynamic frontend path
// based on the RAILS_RELATIVE_URL_ROOT setting
// https://webpack.js.org/guides/public-path/
const ASSET_BASE_PATH = '/assets/frontend/';

// Sets the relative base path
window.appBasePath = jQuery('meta[name=app_base_path]').attr('content') || '';

// Ensure to set the asset base for dynamic code loading
// https://webpack.js.org/guides/public-path/
__webpack_public_path__ = window.appBasePath + ASSET_BASE_PATH;

window.ErrorReporter = new SentryReporter();

require('core-app/init-vendors');
require('core-app/init-globals');

const meta = jQuery('meta[name=openproject_initializer]');
const locale = meta.data('locale') || 'en';
const firstDayOfWeek = parseInt(meta.data('firstDayOfWeek'), 10);
I18n.locale = locale;
I18n.firstDayOfWeek = firstDayOfWeek;
moment.locale(locale, {
  week: {
    dow: firstDayOfWeek,
    // TODO: This is calculated by ISO-8601, however, the US and Canada for example use a different calculation
    // See also: https://community.openproject.org/projects/openproject/work_packages/35664/activity
    doy: 7 + firstDayOfWeek - 4,
  },
});

if (environment.production) {
  enableProdMode();
}

// Enable debug logging for reactive states
whenDebugging(() => {
  (window as any).enableReactiveStatesLogging = () => enableReactiveStatesLogging(true);
  (window as any).disableReactiveStatesLogging = () => enableReactiveStatesLogging(false);
});

// Import the correct locale early on
import(`./locales/${I18n.locale}.js`)
  .then(() => {
    jQuery(function () {
      // Due to the behaviour of the Edge browser we need to wait for 'DOM ready'
      platformBrowserDynamic()
        .bootstrapModule(OpenProjectModule)
        .then(platformRef => {
          jQuery('body').addClass('__ng2-bootstrap-has-run');
        });
    });
});
