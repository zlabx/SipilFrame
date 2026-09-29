// Components
import App from './App.vue';

// Composables
import { createApp } from 'vue';

// Google Analytics
import { createGtag } from 'vue-gtag';

// Plugins
import { registerPlugins } from '@/plugins';

// Sentry
import * as Sentry from '@sentry/vue';

import './assets/main.scss';

const app = createApp(App);

app.config.globalProperties.window = window;

if (import.meta.env.PROD) {
  // Google analytics - production only and when specified
  if (import.meta.env.VITE_GANALYTICS_TAG_ID) {
    const gtag = createGtag({
      tagId: import.meta.env.VITE_GANALYTICS_TAG_ID,
    });
    app.use(gtag);
  }

  // SipilFrame: DSN upstream (EduBeam) dihapus supaya data pengguna tidak terkirim ke proyek Sentry pihak lain.
  // Sentry hanya aktif bila VITE_SENTRY_DSN di-set (DSN milik sendiri).
  const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
  if (sentryDsn) {
    Sentry.init({
      app,
      dsn: sentryDsn,
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
          maskAllText: false,
          blockAllMedia: false,
        }),
      ],
      // Performance Monitoring
      tracesSampleRate: 1.0, //  Capture 100% of the transactions
      // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
      tracePropagationTargets: ['localhost', /^https:\/\/run\.edubeam\.app/],
      // Session Replay
      replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
      replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
      /*beforeSend(event, hint) {
      // Check if it is an exception, and if so, show the report dialog
      if (event.exception && event.event_id) {
        Sentry.showReportDialog({ eventId: event.event_id });
      }
      return event;
    },*/
    });
  }
}

registerPlugins(app);

app.mount('#app');
