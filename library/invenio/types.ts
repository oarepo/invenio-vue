import {Http, HttpError, HttpLoadOptions, HttpOptions, HttpQuery, useHttp} from '../http'
import {Ref} from "vue";
import {SWRVCache} from "swrv";
import {NullableProps} from "../types";

export interface JsonType {
    [key: string]: string | null | number | boolean | JsonType
}

enum JsonDateTimeBrand {}

export type JsonDateTime = string & JsonDateTimeBrand;

export type FacetDefinition = JsonType

export type FacetDefinitions = Record<string, FacetDefinition>

export type Facet = JsonType

export interface InvenioCollectionRecord<CollectionRecord> {
    metadata: CollectionRecord,
    links: {
        self: string,
        [key: string]: string
    },
    revision: number,
    created: JsonDateTime,
    updated: JsonDateTime,
    id: string
}

export type InvenioCollectionRecordList<CollectionRecord> = Array<InvenioCollectionRecord<CollectionRecord>>

export interface PaginatedInvenioCollection<CollectionRecord> {
    hits: {
        hits: InvenioCollectionRecord<CollectionRecord>[],
        total: number | {
            value: number,
            relation: "eq" | "gte"
        }
    },
    links: {
        "self": "string",
        "next": "string",
        "previous": "string"
    },
    aggregations: any
}

export interface InvenioCollectionHttpOptions {
    facets: FacetDefinition[],
    filters: any[]
}

/**
 * options on invenio collection
 */
export type InvenioCollectionOptions<CollectionRecord, ErrorType extends HttpError> = {
    /**
     * a function that transforms a record. Can be used to implement custom logic on the record
     * before it is returned.
     *
     * @param record                  record to be shown
     */
    recordTransformer?: (
        record: InvenioCollectionRecord<CollectionRecord>,
        opts: {
            options: InvenioCollectionOptions<CollectionRecord, ErrorType>,
            collection: InvenioCollectionComposable<CollectionRecord, ErrorType>
        }
    ) => InvenioCollectionRecord<CollectionRecord>,

    /**
     * a function that transforms facets after they were fetched from the server
     *
     * @param facets                  facets
     */
    facetsTransformer?: (
        facets: Record<string, Facet>,
        opts: {
            options: InvenioCollectionOptions<CollectionRecord, ErrorType>,
            collection: InvenioCollectionComposable<CollectionRecord, ErrorType>
        }
    ) => Record<string, Facet>,

    /**
     * a function that transforms a facet definition. Can be used to add types to facets,
     * their labels etc.
     *
     * @param facetDefinition
     * @param opts
     */
    facetDefinitionTransformer?: (
        facetDefinitions: FacetDefinitions,
        opts: {
            options: InvenioCollectionOptions<CollectionRecord, ErrorType>,
            collection: InvenioCollectionComposable<CollectionRecord, ErrorType>
        }
    ) => FacetDefinitions,

    optionsCache?: SWRVCache<any>;

} & HttpOptions<PaginatedInvenioCollection<CollectionRecord>, ErrorType>

export interface InvenioCollectionComposable<CollectionRecord,
    ErrorType extends HttpError> {

    load: (opts?: HttpLoadOptions) => void,
    loadFacets: (opts: HttpLoadOptions & { selectedFacets: string[] }) => void | Promise<any>,

    // loaded records and their loading state. To see the loading state of facets/options, use the low-level connections
    records: Ref<InvenioCollectionRecordList<CollectionRecord>>,
    stale: Ref<boolean>,
    loading: Ref<boolean>,
    loaded: Ref<boolean>,

    pages: Ref<number>,
    page: Ref<number>,
    pageSize: Ref<number>,

    recordsCount: Ref<number>,
    recordsCountString: Ref<string>,

    // loaded and transformed facet definitions and actual facets
    facetDefinitions: Ref<FacetDefinitions>,

    // low-level connections for http (record list), options, facets (facets=[], size=0)
    http: Http<PaginatedInvenioCollection<CollectionRecord>, ErrorType>,
    httpOptions: Http<InvenioCollectionHttpOptions, ErrorType>,
    httpFacets: Http<PaginatedInvenioCollection<CollectionRecord>, ErrorType>

    setUrl: (url: string) => void
}

export interface InvenioRecord<RecordMetadata> {
    metadata: RecordMetadata
}

export type InvenioRecordOptions<Record, ErrorType extends HttpError> =
    {} & HttpOptions<InvenioRecord<Record>, ErrorType>

export interface InvenioRecordComposable<RecordMetadata, ErrorType extends HttpError> {

    http: Http<InvenioRecord<RecordMetadata>, ErrorType>,
    metadata: Ref<RecordMetadata | undefined>,
    setUrl: (url: string) => void,
    createModel: () => Ref<NullableProps<RecordMetadata>>
    releaseModel: () => void
}

