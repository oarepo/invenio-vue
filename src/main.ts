import {createApp} from 'vue'
import App from './App.vue'
import VueQuerySynchronizer from "@oarepo/vue-query-synchronizer";
import InvenioApi from '@oarepo/invenio-vue'
import router from './router'
import axios from 'axios'
import {Quasar} from 'quasar'
import quasarUserOptions from './quasar-user-options'
import QuasarESFacets from '@oarepo/quasar-es-facets'

axios.defaults.headers = {
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Authorization': 'Bearer DYfJ2TM4rO26luBwODkFg44XJoFa9T3dPVqL3twi5BJ07t29c3XkkUqYS44y'
};

createApp(App).use(Quasar, quasarUserOptions).use(router).use(VueQuerySynchronizer, {
    router
}).use(InvenioApi).use(QuasarESFacets).mount('#app')
