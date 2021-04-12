import {
    InvenioCollectionComposable, InvenioRecord,
    InvenioRecordComposable,
    InvenioRecordOptions,
    JsonType,
    PaginatedInvenioCollection
} from "./types";
import {HttpError, useHttp} from "../http";
import {computed, Ref, ref, toRaw, watch} from "vue";
import {useModel} from "../model";
import deepcopy from "deepcopy";
import {NullableProps} from "../types";

export function useInvenioRecord<RecordMetadata extends JsonType, ErrorType extends HttpError>(
    url: string,
    options?: InvenioRecordOptions<RecordMetadata, ErrorType>
): InvenioRecordComposable<RecordMetadata, ErrorType> {

    options = options || {}
    if (!options.headers) {
        options.headers = {}
    }
    options.headers['Accept'] = 'application/json'


    const http = useHttp<InvenioRecord<RecordMetadata>, ErrorType>(
        url, {}, {
            method: 'get',
            ...options,
        }
    )

    const model = ref<NullableProps<RecordMetadata>>()

    const metadata = computed(() => {
        if (http.data.value) {
            return http.data.value.metadata
        }
        return undefined
    })

    function setUrl(url: string) {
        http.url.value = url
    }

    function createModel(): Ref<NullableProps<RecordMetadata>> {
        if (model.value) {
            return model as Ref<NullableProps<RecordMetadata>>
        }
        if (metadata.value) {
            model.value = deepcopy(toRaw(metadata)) as NullableProps<RecordMetadata>
        }
        return model as Ref<NullableProps<RecordMetadata>>
    }

    function releaseModel() {
        model.value = undefined
    }

    // when metadata are fetched, set the inner model to them
    watch(metadata, () => {
        if (model.value) {
            model.value = deepcopy(toRaw(metadata)) as NullableProps<RecordMetadata>
        }
    })

    return {
        http,
        metadata,
        setUrl,
        createModel,
        releaseModel
    }
}
