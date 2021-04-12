import CollectionWrapper from '../components/CollectionWrapper.vue'
import deepmerge from 'deepmerge'
import {InvenioCollectionOptions} from "../invenio";
import {HttpError} from "../http";


/**
 * Generates route path for a collection
 *
 * @param options                 options
 * @param {string} options.name            Route name
 * @param {string} options.url             Invenio api url, defaults to the current route path
 * @param {string} options.path            route path.
 * @param {Component} options.component
 *                                viewer component for showing the records and facets
 * @param {string|Component} options.errorComponent component shown on error
 *
 * - if component is passed it will be used to render the error
 * - If set to 'viewer', viewerComponent will be used
 * - If undefined, simple component showing the error with a retry button is shown
 *
 * @param {string|Component} options.loadingComponent component shown while loading records
 *
 * - if component is passed it will be used during loading when records are not available.
 * - If set to 'viewer', viewerComponent will be used during loading
 * - If undefined, empty space is shown during load
 *
 * @param {InvenioHttpOptionOptions} options.httpOptionsProps
 *      InvenioHttpOptionOptions used for fetching collection options
 * @param {InvenioCollectionListOptions} options.httpGetProps
 *      InvenioCollectionListOptions used for fetching the collection
 *
 * @param extra                   extra parameters to be merged with the route object
 *
 * @returns object to put into the router routes
 *
 * *Viewer/Loading/Error component*
 *
 * The component is passed the following props:
 *
 * ```html
 * <component
 :is="currentComponent"
 :collection="collection" (instance of InvenioCollectionComposable)
 v-bind="propsAndAttributes"
 ></component>
 * ```
 *
 * *Example*:
 *
 * ```javascript
 *  routes = [
 *    collection({
 *        name: 'all',
 *        path: '/all/'
 *        component: MyCollectionViewer,
 *      },
 *    )
 *  ]
 * ```
 */
export function collection<CollectionRecord, ErrorType extends HttpError>(
    opts: {
        name: string,
        path: string,
        component: string | Object | Function,
        errorComponent?: string | Object | Function,
        loadingComponent?: string | Object | Function,
        url?: string,
        options?: InvenioCollectionOptions<CollectionRecord, ErrorType>
    },
    extra: any
):
    any {
    let proto = {
        path: (opts.path !== undefined ? opts.path : '/'),
        name: opts.name,
        component: CollectionWrapper,
        props: {
            viewerComponent: opts.component,
            errorComponent: opts.errorComponent,
            loadingComponent: opts.loadingComponent,
            url: opts.url,
            options: opts.options || {
                revalidateOnFocus: false
            }
        },
        meta: {
            query: {
                page: 'int:1',
                size: 'int:10',
                facets: 'array:',
                q: 'string:'
            }
        }
    }
    if (extra) {
        proto = deepmerge(proto, extra)
    }
    return proto
}
