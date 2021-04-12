<template>
  <component
      :is="currentComponent"
      :collection="collection"
      v-bind="propsAndAttributes"
  ></component>
</template>
<script lang="ts">
import {computed, defineAsyncComponent, defineComponent, ref, resolveComponent, watch} from 'vue'
import {useInvenioCollection} from '../invenio/collection'
import {useQuery} from "@oarepo/vue-query-synchronizer";
import {callAndWatch} from "../utils";
import {InvenioCollectionComposable} from "../invenio";
import {useRoute} from "vue-router";
// @ts-ignore // workaround for https://github.com/ezolenko/rollup-plugin-typescript2/issues/129
import EmptyLoadingComponent from './EmptyLoadingComponent.vue'
// @ts-ignore
import SimpleErrorComponent from './SimpleErrorComponent.vue'

export default defineComponent({
  name: 'invenio-collection-wrapper',
  props: {
    viewerComponent: {
      required: true,
      type: [Object, Function, String]
    },
    loadingComponent: {
      type: [Object, Function, String],
      default: undefined
    },
    errorComponent: {
      type: [Object, Function, String],
      default: undefined
    },
    url: {
      type: String,
      // default: the same as current route url
    },
    options: {
      type: Object
    }
  },
  setup(props, ctx) {
    const collection = ref<InvenioCollectionComposable<any, any>>()
    const query = useQuery()
    const route = useRoute()

    const currentUrl = computed(() => props.url || route.path)

    callAndWatch([props.options], () => {
      collection.value = useInvenioCollection(
          currentUrl.value,
          query,
          props.options
      )
    }, {deep: true})

    watch(currentUrl, (newUrl) => {
      collection.value!.setUrl(newUrl)
    })

    callAndWatch([query], () => {
      reload()
    }, {
      deep: true
    })

    watch(collection, () => {
      reload()
    })

    function reload() {
      collection.value!.load({
        query: query
      })
    }

    function resolve(c: any, viewer: any, defaultComponent: any) {
      if (c === 'viewer') {
        return viewer
      }
      if (!c) {
        return defaultComponent
      }
      if (typeof c === 'string') {
        return resolveComponent(c)
      }
      return defineAsyncComponent(c)
      // return c
    }

    const viewerComponent = resolve(
        props.viewerComponent, EmptyLoadingComponent, EmptyLoadingComponent)

    const loadingComponent = resolve(props.loadingComponent, viewerComponent, EmptyLoadingComponent)

    const errorComponent = resolve(props.errorComponent, viewerComponent, SimpleErrorComponent)

    const currentComponent = computed(() => {
      const col = collection.value
      if (!col) {
        return null
      }
      if (col.http.error) {
        return errorComponent
      }
      if (col.http.data) {
        return viewerComponent
      }
      return loadingComponent
    })

    return {
      collection,
      propsAndAttributes: {...props, ...ctx.attrs},
      currentComponent
    }
  }
})
</script>
