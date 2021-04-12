# @oarepo/invenio-api-vue-composition

## Installation

```bash
    yarn add @oarepo/vue-query-synchronizer
    yarn add @oarepo/invenio-api-vue-composition
```


```javascript
    // main.js
    app.use(VueQuerySynchronizer, {
        debug: true,
        router: router
    })
```

## Common usage - API passed as props to your component

### Collection and record viewers

Wrap your components when you add them into routes:

```javascript
export const routes = [
    
    // note: record needs to be the first because of its path 
    record({
        name: 'record-viewer-editor',
        // path is implicitely '/${collectionCode}'  -we want the records in the root, so have to create it manually
        path: '/:recordId',
        collectionCode: 'records',
        component: RecordViewer
    }),

    collection({
        name: 'record-list',
        path: '/',
        collectionCode: 'records',
        component: CollectionViewer,
        recordRouteName: 'record-viewer'
    })
] 
```

This will inject a wrapper component (invisible in DOM tree) that fetches the collection/record, 
shows the loading status and possible errors, on success pass records and facets to your component 
and reacts to facet selection, pagination and search as emitted by your component.

A sample implementation of  [CollectionViewer](src/components/CollectionViewer.vue) is in the demo.

[Facet](src/components/Facet.vue) shows that each facet contains a reactive model that can be used to 
directly toggle the facet on/off.

For a record viewer see [RecordViewer](src/components/RecordViewer.vue)
 
See the [collection API docs](https://oarepo.github.io/invenio-api-vue-composition/api/#collection)
 and [record API docs](https://oarepo.github.io/invenio-api-vue-composition/api/#record)
 for possible parameters and for an extensive list of properties that are passed to your component.

### API access

You can have an access to API either via the wrappers above - but they always fetch the data before your component
gets called - or via the "api" wrappers:


```javascript
export const routes = [
    collectionApi({
        name: 'record-creator',
        path: '/create',
        collectionCode: 'records',
        component: RecordCreator
    }),
] 
```

This wrapper just creates the API, pre-populates it with the baseUrl and collection code and passes control
(with all props) to your component.

It is usable for example, for creating new records as shown above, as there is no need to load the collection
when a new record is created within it.

See [collection API docs](https://oarepo.github.io/invenio-api-vue-composition/api/#collectionapi) for details

## Composable API

The ``collectionApi`` or ``recordApi`` props passed to your component are return values of
Composable API functions ``useInvenioCollection`` and ``useInvenioRecord``.

If you want you can use them directly without the wrapper components (
but always directly in the ``setup`` function, you can not initialize them later, as in event handlers):

```vue
<template>...</template>
<script>
import {useInvenioCollection} from '@oarepo/invenio-api-vue-composition'

export default {
    function setup(props, ctx) {
        {
            error,
            facets,
            records,
            load
            // see the docs for other options here
        } = useInvenioCollection('/api')

        load('records')
        return {
           error, facets, records
        }
    }
}
</script>
```  

More documentation is at [API docs](https://oarepo.github.io/invenio-api-vue-composition/api/#useinveniocollection)

