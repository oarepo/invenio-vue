/**
 * Invenio collection getter. When the collection is loaded, performs extra OPTIONS call
 * to get collection options - human name, facets, filters, etc...
 *
 * The options are cached and re-fetched once a day
 *
 * @param baseUrl             the base url of invenio API server
 * @param httpGetOptions      extra options for listing request
 * @param httpOptionOptions   extra options for HTTP options request
 * @returns                   composable UseInvenioCollectionComposable
 */
import {HttpError, HttpLoadOptions, HttpOptions, HttpQuery, useHttp} from "../http";
import {
    Facet, FacetDefinition, FacetDefinitions,
    InvenioCollectionComposable,
    InvenioCollectionHttpOptions,
    InvenioCollectionOptions, InvenioCollectionRecord, InvenioCollectionRecordList, JsonType,
    PaginatedInvenioCollection
} from "./types";
import {computed, Ref, ref, watch} from "vue";
import {optionsCache} from "./options";

export function useInvenioCollection<CollectionRecord extends JsonType, ErrorType extends HttpError>(
    url: string,
    initialQuery?: HttpQuery,
    options?: InvenioCollectionOptions<CollectionRecord, ErrorType>
): InvenioCollectionComposable<CollectionRecord, ErrorType> {

    options = options || {}
    initialQuery = initialQuery || {}
    if (!options.headers) {
        options.headers = {}
    }
    options.headers['Accept'] = 'application/json'

    const recordTransformer = options.recordTransformer ||
        ((record: InvenioCollectionRecord<CollectionRecord>) => record)

    const facetsTransformer = options.facetsTransformer ||
        ((facets: Record<string, Facet>) => facets)

    const facetDefinitionTransformer = options.facetDefinitionTransformer ||
        ((facetDefinitions: FacetDefinitions) => facetDefinitions)

    const records = ref<InvenioCollectionRecordList<CollectionRecord>>([])

    const pageSize = ref(parseInt(initialQuery.size as string || "") || 10)
    const page = ref(parseInt(initialQuery.page as string || "") || 1)

    const http = useHttp<PaginatedInvenioCollection<CollectionRecord>, ErrorType>(
        url, {page: page.value.toString(), size: pageSize.value.toString(), ...initialQuery}, {
            method: 'get',
            ...options,
        }
    )

    const httpFacets = useHttp<PaginatedInvenioCollection<CollectionRecord>, ErrorType>(
        url, {...initialQuery, size: '0'}, {
            method: 'get',
            ...options,
            loadInitial: false,
        }
    )

    const httpOptions = useHttp<InvenioCollectionHttpOptions, ErrorType>(
        url, {...initialQuery, facets: null}, {
            ...(options as HttpOptions<InvenioCollectionHttpOptions, ErrorType>),
            method: 'options',
            cache: options.optionsCache || optionsCache
        }
    )

    watch(http.data, () => {
        records.value = (http.data.value?.hits?.hits || []).map(
            (record: InvenioCollectionRecord<CollectionRecord>) => {
                if (!record.links?.ui && record.links?.self) {
                    record.links.ui = new URL(record.links.self).pathname
                }
                return recordTransformer(
                    record,
                    {
                        options: options!,
                        collection: th
                    }
                )
            }) as any
    })

    function load(opts?: HttpLoadOptions) {
        if (!httpOptions.loaded.value) {
            httpOptions.reload()
        }
        const query = {...http.query.value, ...(opts?.query || {})}
        query.facets = true
        http.load({...(opts || {}), query})
    }

    function loadFacets(opts: HttpLoadOptions & { selectedFacets: string[] }) {
        httpFacets.load({
            query: {...httpFacets.query.value, facets: opts.selectedFacets}
        })
    }

    const facetDefinitions: Ref<FacetDefinitions> = computed(() => {
        const defs = (httpOptions.data.value?.facets || []).reduce(
            (p, d, idx) => {
                p[d.code as string] = {
                    label: (d.facet as JsonType)?.label,
                    order: idx,
                    ...d,
                }
                return p
            }, {}) as FacetDefinitions

        return facetDefinitionTransformer(defs, {
            options: options!,
            collection: th
        })
    })

    watch(pageSize, () => {
        if (pageSize.value <= 0) {
            pageSize.value = 10
        }
        if (http.query.value.size != pageSize.value.toString()) {
            http.query.value.size = pageSize.value.toString()
        }
    })

    watch(() => http.query.value.size, (ps) => {
        pageSize.value = parseInt(ps as string)
    })

    const pages = computed(() => {
        if (!http.data.value) {
            return 0
        }
        const hits = http.data.value.hits.total
        const records: number = typeof hits === 'object' ? hits.value : hits
        return Math.ceil(records / pageSize.value)
    })

    watch(page, () => {
        if (page.value < 1) {
            page.value = 1
        }
        if (pages.value && page.value > pages.value) {
            page.value = pages.value
        }
        if (http.query.value.page != page.value.toString()) {
            http.query.value.page = page.value.toString()
        }
    })

    watch(() => http.query.value.page, (ps) => {
        page.value = parseInt(ps as string)
    })

    function setUrl(url: string) {
        http.url.value = url
        httpOptions.url.value = url
        httpFacets.url.value = url
        httpFacets.loadEnabled.value = false

        // reload options
        httpOptions.reload({keepPrevious: false})

        // load list of records together with facets
        http.load({
            query: http.query.value,
            keepPrevious: false
        })
    }

    const th: InvenioCollectionComposable<CollectionRecord, ErrorType> = {
        records: records as any,
        http,
        httpOptions,
        httpFacets,
        load,
        loadFacets,
        facetDefinitions,
        stale: http.stale,
        loading: http.loading,
        loaded: http.loaded,
        pages,
        page,
        pageSize,
        setUrl
    }
    return th
}
