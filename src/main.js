import Vue from 'vue'
import App from './App.vue'
import router from './router'
import VueMeta from 'vue-meta'

import * as Sentry from '@sentry/browser';
import { CaptureConsole, Vue as VueIntegration } from '@sentry/integrations';

import * as subscriptionStore from './components/common/subscriptionStore'
import * as helpers from './utils/helpers'

Vue.use(VueMeta, {
  // optional pluginOptions
  refreshOnceOnNavigation: true
})

window.domain = ''
if(window.location.href.includes('localhost') || !window.location.href.includes('curve.fi')) window.domain = 'https://curve.fi'

import '../public/tvisionbase.css'
import '../public/tvision.css'
import './registerServiceWorker'

subscriptionStore.init();

Vue.config.productionTip = false

//adding Sentry as soon as possible
process.env.NODE_ENV == 'production' && Sentry.init({ 
  dsn: 'https://5494f535e0244513a301f2912f5d899f@sentry.io/4169463',
  integrations: [
    new CaptureConsole({
      levels: ['warn', 'error', 'debug', 'assert']
    }),
    new VueIntegration({Vue, attachProps: true})
  ],
});


new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
