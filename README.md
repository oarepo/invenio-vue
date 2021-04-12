# @oarepo/invenio-vue

## Installation

```bash
    yarn add @oarepo/vue-query-synchronizer
    yarn add @oarepo/invenio-vue
```

If you use quasar, you might want to add facets library:

```bash
    yarn add @oarepo/quasar-es-facets
```

In the main script:

```javascript
import {createApp} from 'vue'
import App from './App.vue'
import VueQuerySynchronizer from "@oarepo/vue-query-synchronizer";
import InvenioApi from '@oarepo/invenio-vue'
import router from './router'
import axios from 'axios'

// if quasar
import {Quasar} from 'quasar'
import quasarUserOptions from './quasar-user-options'
import QuasarESFacets from '@oarepo/quasar-es-facets'

axios.defaults.headers = {
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Expires': '0',
};

createApp(App)
    .use(router)
    .use(VueQuerySynchronizer, {router})
    .use(InvenioApi)

    // if quasar
    .use(Quasar, quasarUserOptions)
    .use(QuasarESFacets)

    // and mount
    .mount('#app')
```

## Common usage - API passed as props to your component

### Collection and record viewers

Wrap your components when you add them into routes:

```javascript
import {collection, record} from '@oarepo/invenio-vue'

export const routes = [
    record({
        name: 'record-viewer-editor',
        path: '/:recordId',
        component: Record
    }),

    collection({
        name: 'record-list',
        path: '/',
        component: Collection,
    })
] 
```

This will inject a wrapper component (invisible in DOM tree) that fetches the collection/record, shows the loading
status and possible errors, on success pass records and facets to your component and reacts to facet selection,
pagination and search as emitted by your component.

A sample implementation of  [Collection](src/components/Collection.vue) is in the demo.

For a record viewer see [Record](src/components/Record.vue)

## Composable API

TODO
