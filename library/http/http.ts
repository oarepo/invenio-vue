import type {Http, HttpError, HttpOptions} from './types'
import {HttpQuery} from "./types";
import axios from 'axios'
import useSWRV from "swrv";
import {stringifyQuery} from "../utils";
import {computed, ref, watch} from 'vue'
import {defaultErrorFormatter} from './errors'
import merge from 'deepmerge'

interface InternalHttp<DataType, ErrorType extends HttpError> extends Http<DataType, ErrorType> {
    store(_data?: DataType, _error?: ErrorType): void
}

/**
 * A simple http wrapper around fetcher that uses axios.
 * @see useFetcher
 *
 * @param initialUrl   the base url
 * @param initialQuery the initial query
 * @param options
 * @returns {Http<DataType, ErrorType>}
 */
export function useHttp<DataType, ErrorType extends HttpError>
(
    initialUrl?: string,
    initialQuery?: HttpQuery,
    options?: HttpOptions<DataType, ErrorType>
): Http<DataType, ErrorType> {

    const loadEnabled = ref(options?.loadInitial || false)
    const url = ref(initialUrl)
    const query = ref<HttpQuery>({...(initialQuery || {})})
    let keepPrevious = false
    const stale = ref(false)
    const loaded = ref(false)
    const data = ref<DataType>()
    const error = ref<ErrorType>()
    const forceCounter = ref(1)
    const finishedAt = ref<Date>()
    const headers = ref(options?.headers || {})
    const promise = {} as {
        key?: string|null,
        accept?: (data: DataType) => void,
        reject?: (error: ErrorType) => void
    }

    function makeFullUrl(_url?: string, _query?: HttpQuery): string | undefined {
        if (_query && _url) {
            return `${_url}${stringifyQuery(_query)}`
        }
        return _url
    }

    function makeActionUrl(action?: string) {
        if (action) {
            let _url = url.value
            if (!_url) {
                return makeFullUrl(action, query.value)
            }
            if (!_url.endsWith('/')) {
                _url += '/'
            }
            _url += action
            return makeFullUrl(_url, query.value)
        } else {
            return makeFullUrl(url.value, query.value)
        }
    }

    const fullUrl = computed(() => makeFullUrl(url.value, query.value))

    const key = computed(() => directKey())

    function directKey() {
        if (loadEnabled.value && fullUrl.value) {
            return `${options?.method || 'get'}:${forceCounter.value}:${fullUrl.value}`
        } else {
            return null
        }
    }

    const {data: rawData, error: rawError, isValidating, mutate} =
        useSWRV(
            () => key.value,
            async key => {
                try {
                    const resp = (await axios[options?.method || 'get'](fullUrl.value!, {
                        headers: headers.value
                    })).data
                    return {
                        promiseKey: promise.key,
                        payload: resp
                    }
                } catch (e) {
                    throw {
                        promiseKey: promise.key,
                        error: e
                    }
                }
            }, options || {})

    watch([isValidating, rawData, rawError], ([val, rawDataVal, rawErrorVal]) => {
        if (val) {
            if (keepPrevious && data.value) {
                stale.value = true
            }
        } else {
            finishedAt.value = new Date()
            if (rawError.value) {
                error.value = options?.errorFormatter ?
                    options.errorFormatter(rawError.value.error) :
                    defaultErrorFormatter(rawError.value.error) as ErrorType
                if (rawError.value.promiseKey) {
                    rejectPromise(error.value)
                }
            } else if (rawData.value) {
                loaded.value = true;
                data.value = rawData.value.payload
                error.value = undefined
                if (rawData.value.promiseKey) {
                    acceptPromise(rawData.value.payload)
                }
            }
        }
    })

    function acceptPromise(data: DataType) {
        if (promise.accept) {
            const accept = promise.accept
            promise.accept = undefined
            promise.reject = undefined
            accept(data)
        }
    }

    function rejectPromise(error: ErrorType) {
        if (promise.reject) {
            const reject = promise.reject
            promise.accept = undefined
            promise.reject = undefined
            reject(error)
        }
    }

    function load(opts?: {
        url?: string,
        query?: HttpQuery,
        force?: boolean,
        keepPrevious?: boolean,
        returnPromise?: boolean
    }) {
        if (opts?.keepPrevious !== undefined) {
            keepPrevious = opts.keepPrevious
        } else {
            if (options?.keepData && data.value && url.value) {
                keepPrevious = options.keepData(
                    data.value as DataType, error.value,
                    url.value,
                    query.value,
                    opts?.url || url.value,
                    opts?.query || query.value,
                    options)
            } else {
                keepPrevious = false
            }
        }
        if (!keepPrevious) {
            loaded.value = false
        }
        query.value = opts?.query || {}
        if (opts?.url) {
            url.value = opts.url
        }
        if (opts?.force || !opts?.url) {
            forceCounter.value += 1
        }
        loadEnabled.value = true
        if (opts?.returnPromise) {
            return new Promise((accept, reject) => {
                promise.accept = accept
                promise.reject = reject
                promise.key = directKey()
            })
        }
    }

    function reload(opts?: { keepPrevious?: boolean }) {
        load({...opts || {}, force: true})
    }

    function prefetch(data: DataType, _query?: HttpQuery) {
        const key = `${forceCounter.value}:${makeFullUrl(url.value, _query)}`
        mutate(() => ({
            promiseKey: undefined,
            payload: data
        }), {})
        query.value = _query || {}
    }

    function store(_data?: DataType, _error?: ErrorType) {
        finishedAt.value = new Date()
        if (_data) {
            prefetch(_data)
            data.value = _data
            loaded.value = true
            error.value = undefined
        }
        if (_error) {
            error.value = _error
            loaded.value = false
        }
    }

    async function op(opts: {
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
    }): Promise<Http<DataType, ErrorType>> {
        let newHttp: InternalHttp<DataType, ErrorType>;
        if (opts.returnNew) {
            newHttp = (opts?.factory || useHttp)(url.value, query.value, {
                ...(options || {}),
                loadInitial: false
            } as HttpOptions<DataType, ErrorType>) as InternalHttp<DataType, ErrorType>
        }
        try {
            const resp = await axios.request({
                method: opts.method,
                url: makeActionUrl(opts.action),
                data: opts.data,
                ...(opts.options || {}),
                headers: headers.value
            })
            const data = resp.data
            const location = resp.headers['Location']

            if (opts?.replaceContent) {
                if (data) {
                    store(data)
                } else {
                    store(opts.data)
                }
                if (location) {
                    loadEnabled.value = false
                    url.value = location
                }
            } else if (opts?.returnNew) {
                if (data) {
                    newHttp!.store(data)
                } else {
                    newHttp!.store(opts.data)
                }
                if (location) {
                    newHttp!.loadEnabled.value = false
                    newHttp!.url.value = location
                }
                return newHttp!
            }
        } catch (e) {
            const parsedError = options?.errorFormatter ?
                options.errorFormatter(rawError.value) :
                defaultErrorFormatter(rawError.value) as ErrorType
            if (opts?.replaceContent) {
                store(undefined, parsedError)
            } else if (opts?.returnNew) {
                newHttp!.store(undefined, parsedError)
                return newHttp!
            }
        }
        return th
    }

    async function post(opts: {
        data: any,
        action?: string,
        options?: any,
        replaceContent?: boolean,
        returnNew?: boolean,
        factory?: (
            initialUrl?: string,
            options?: HttpOptions<DataType, ErrorType>
        ) => Http<DataType, ErrorType>
    }) {
        return await op({
            ...opts,
            method: 'post',
            options: merge(
                {headers: {'Content-Type': 'application/json'}}, opts?.options || {}),
        })
    }

    async function patch(opts: {
        operations: Array<{ op: string, path: string, value: unknown }>,
        options?: any,
        action?: string,
        replaceContent?: boolean,
        returnNew?: boolean,
        factory?: (
            initialUrl?: string,
            options?: HttpOptions<DataType, ErrorType>
        ) => Http<DataType, ErrorType>
    }) {
        return await op({
            ...opts,
            data: opts.operations,
            method: 'patch',
            options: merge(
                {headers: {'Content-Type': 'application/json-patch+json'}}, opts?.options || {}),
        })
    }

    async function remove(opts: { options?: any, action?: string }) {
        try {
            return (
                await axios.request({
                    method: 'delete',
                    url: fullUrl.value,
                    ...(opts.options || {}),
                    headers: headers.value
                })).data
        } catch (e) {
            throw options?.errorFormatter ?
                options.errorFormatter(rawError.value) :
                defaultErrorFormatter(rawError.value) as ErrorType
        }
    }

    const th = {
        loadEnabled,
        url,
        query: query,
        fullUrl,
        stale,
        loading: isValidating,
        loaded,
        data,
        error,
        load,
        reload,
        prefetch,
        store,
        post,
        patch,
        remove,
        op,
        finishedAt,
        headers
    } as Http<DataType, ErrorType>

    return th
}

export type UseHttp = typeof useHttp
