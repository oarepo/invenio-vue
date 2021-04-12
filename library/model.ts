import {Ref, ref, toRaw, watch} from 'vue';
import {NullableProps} from './types';
import deepcopy from 'deepcopy';

type Emit = (event: any, ...args: unknown[]) => void

interface ModelProps {
    name?: string,
    emit?: Emit,
    defaultValue?: any
}

export function useModel() {

    function refModel<T>(
        props: Record<string, any>,
        params?: ModelProps
    ): Ref<NullableProps<T>> {
        let name = params && params.name;
        const emit = params && params.emit;
        const defaultValue = params && params.defaultValue;

        if (!name) {
            name = 'modelValue';
        }
        const model = ref(deepcopy(toRaw(props[name]) as T) || defaultValue);
        if (emit) {
            watch(model, () => {
                emit(`update:${name!}`, model.value);
            }, {deep: true});
        }
        return model;
    }

    return {
        refModel,
    };
}
