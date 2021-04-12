import {Ref} from 'vue'
import {IConfig} from 'swrv';

/**
 * A default implementation of transformed error from axios that should simplify handling
 * error in callers.
 *
 * @param {string} type
 *
 *   - 'responseMissing' if the request was not delivered to the server or the server did not respond
 *   - 'notAllowed' if the client is not allowed to perform the operation (403, 405)
 *   - 'clientError' if the data supplied by client were wrong (other status codes 400-499)
 *   - 'serverError' if the data supplied by client were ok but the server failed (status codes 500-599)
 *   - 'unknown' an unknown error happened
 * @param rawError the raw error received
 * @param request  the full http request, if known
 * @param {number} status   HTTP status code
 * @param reason   payload data of the error as received from server
 * @param response the full http response, if known
 */
export type HttpError = {
    type: 'responseMissing',
    rawError: any,
    request: any
} | {
    type: 'unauthorized',
    rawError: any,
    request: any,
    status: number,
    reason: any,
    response: any
} | {
    type: 'clientError',
    rawError: any,
    request: any,
    status: number,
    reason: any,
    response: any
} | {
    type: 'serverError',
    rawError: any,
    request: any,
    status: number,
    reason: any,
    response: any
} | {
    type: 'unknown',
    rawError: any,
}

export type HttpQuery = Record<string, string | string[] | null| boolean>

/**
 * Options passed to useFetcher composable
 */
export type HttpOptions<DataType, ErrorType> = {
    method?: "get" | "options"

    /**
     * function responsible for converting raw error (for example from axios) to a more suitable generic error type
     * @param rawError
     */
    errorFormatter?: (rawError: any) => ErrorType,

    /**
     * A function that is called while the data are being loaded.
     * @param data        previous data
     * @param error       previous error
     * @param oldUrl      the old url
     * @param oldQuery    the old query
     * @param newUrl      the new url
     * @param newQuery    the new query
     * @param context     loading context with url, query and options
     *
     * @returns true      if the previous data should be kept, false if they should be cleared on loading
     */
    keepData?: (data: DataType, error: ErrorType | undefined,
                oldUrl: string, oldQuery: any,
                newUrl: string, newQuery: any,
                options: HttpOptions<DataType, ErrorType>) => boolean,

    /**
     * If true, load the initial url, otherwise wait for the first load/reload call
     */
    loadInitial?: boolean,

    headers?: any
} & IConfig<DataType>

export type HttpLoadOptions = {
    query?: HttpQuery, force?: boolean,
    keepPrevious?: boolean, returnPromise?: boolean
}

/**
 * SWRV wrapper for request module. It is a wrapper around a swrv library to split fetched
 * url into three parts: base url, module, query.
 *
 * Usage:
 *
 * ```javascript
 *   const {data, load} = useFetcher<MyDataType, HttpError>('/api', 'get', async (url) => (await axios.get(url)).data)
 *   load('test') // will load /api/test using axios
 *   // do something with data.value after the data arrives, for example show in the template
 * ```
 */
export type Http<DataType, ErrorType extends HttpError> = {

    /**
     * base url (without query etc)
     */
    url: Ref<string | undefined>,

    /**
     * outgoing http headers
     */
    headers: Ref<any>,

    /**
     * query dict
     */
    query: Ref<Record<string, string | string[] | null>>,

    /**
     * Current url?query
     */
    fullUrl: Ref<string | undefined>,

    /**
     * Set to true if the returned data are stale, that is not yet reloaded
     */
    stale: Ref<boolean>,

    /**
     * Set to true if loading is in progress
     */
    loading: Ref<boolean>,

    /**
     * Set to true if at least some data have been loaded (not necesarily in the latest reload)
     */
    loaded: Ref<boolean>,

    /**
     * timestamp when the last request was successfully finished
     */
    finishedAt: Ref<Date>,

    /**
     * The loaded data
     */
    data: Ref<DataType | undefined>,

    /**
     * Any error received from the underlying http library
     */
    error: Ref<ErrorType | undefined>,

    /**
     * Initiates loading of new data
     *
     * @param module  the module to be loaded
     * @param query   query dictionary
     * @param force   true if reload should be trigger even if query are the same as previously loaded
     * @param keepPrevious  if set to true, the previous data/error will be retained until new data are loaded.
     *                if set to false, the previous data/error are cleared at the beginning of loading
     */
    load: (opts?: HttpLoadOptions) => void | Promise<DataType>,

    /**
     * Reloads current data from server
     *
     * @param keepPrevious  if set to true, the previous data/error will be retained until new data are loaded.
     *                if set to false, the previous data/error are cleared at the beginning of loading
     */
    reload: (opts?: { keepPrevious?: boolean }) => void,

    /**
     * Pre-fetches data and exposes them via ``data`` property. An example
     * would be precaching data after they have been created and returned
     * via POST call.
     *
     * @param module    the module for which to precache data
     * @param data      the data to use
     * @param query     optional query
     */
    prefetch: (data: DataType, query?: any) => void

    /**
     * Set from the loadInitial property on opts and then to "true" on each call to load/reload
     *
     * If set to true, HTTP request will be performed, otherwise the HTTP request will not be called
     */
    loadEnabled: Ref<boolean>,

    /**
     * Performs an http operation and optionally loads the result into http object.
     * Note: if neither "replaceContent" nor "returnNew" are passed, the result of the call
     * is ignored
     *
     * method: HTTP method to perform
     * action: If specified, append this action to the current url
     * data: JSON data to send with the request
     * options: any axios.request options
     * replaceContent: if true, replace the content of this http object. Returns this http object
     * returnNew: create a new http object via useHttp, fill it with data and return it
     */
    op: (opts: {
        data: any,
        method: string,
        action?: string,
        options?: any,
        replaceContent?: boolean,
        returnNew?: boolean,
        factory?: (
            initialUrl?: string,
            options?: HttpOptions<DataType, ErrorType>
        ) => Http<DataType, ErrorType>
    }) => Promise<Http<DataType, ErrorType>>

    /**
     * Perform POST operation. See "op" for arguments
     */
    post: (opts: {
        data: any,
        action?: string,
        options?: any,
        replaceContent?: boolean,
        returnNew?: boolean,
        factory?: (
            initialUrl?: string,
            options?: HttpOptions<DataType, ErrorType>
        ) => Http<DataType, ErrorType>
    }) => Promise<Http<DataType, ErrorType>>

    /**
     * Perform JSON Patch operation. See "op" for arguments
     */
    patch: (opts: {
        operations: Array<{ op: string, path: string, value: unknown }>,
        action?: string,
        options?: any,
        replaceContent?: boolean,
        returnNew?: boolean,
        factory?: (
            initialUrl?: string,
            options?: HttpOptions<DataType, ErrorType>
        ) => Http<DataType, ErrorType>
    }) => Promise<Http<DataType, ErrorType>>

    /**
     * Calls http delete on this url
     *
     * @param options axios options passed directly to axios.request({method: delete, ...options})
     * @param action If specified, append this action to the current url
     */
    remove: (opts: { options?: any, action?: any }) => Promise<any>;
}
