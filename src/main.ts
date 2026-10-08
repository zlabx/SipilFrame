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
      // vue-gtag 3 turns gtag's own page view off and leaves it to a router's page tracker, which
      // this app has none of - without this, not a single view was ever recorded
      config: { send_page_view: true },
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
      // Noise nothing in the app can act on: the browser failing to fetch or install the service
      // worker (offline, private mode, storage limits), and Outlook's link scanner rejecting a promise
      // with a plain object while it previews a share link.
      ignoreErrors: [/service ?worker/i, /sw\.js load failed/, 'newestWorker is null', 'Object Not Found Matching Id'],
      denyUrls: [/\/registerSW\.js/],
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
