export default {
    install() {
    }
}

export * from './http'

export * from './invenio'

export {collection, record} from './routing'


// @ts-ignore // workaround for https://github.com/ezolenko/rollup-plugin-typescript2/issues/129
export {default as CollectionWrapper} from './components/CollectionWrapper.vue'

// @ts-ignore // workaround for https://github.com/ezolenko/rollup-plugin-typescript2/issues/129
export {default as RecordWrapper} from './components/RecordWrapper.vue'
