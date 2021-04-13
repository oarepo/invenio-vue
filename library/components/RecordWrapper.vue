<template>
  <component
      :is="currentComponent"
      :record="record"
      v-bind="propsAndAttributes"
      @reload="record.http.reload"
  ></component>
</template>

<script lang="ts">
import {computed, defineAsyncComponent, defineComponent, ref, resolveComponent, watch} from 'vue'
import {useInvenioRecord} from '../invenio/record'
import {InvenioRecordComposable} from "../invenio/types";
import {callAndWatch} from "../utils";
import {useRoute} from "vue-router";
// @ts-ignore // workaround for https://github.com/ezolenko/rollup-plugin-typescript2/issues/129
import EmptyLoadingComponent from './EmptyLoadingComponent.vue'
// @ts-ignore
import SimpleErrorComponent from './SimpleErrorComponent.vue'

export default defineComponent({
  name: 'invenio-record-wrapper',
  props: {
    viewerComponent: {
      required: true,
      type: [Object, Function]
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
    },
    options: {
      type: Object
    }
  },
  setup(props, ctx) {
    const record = ref<InvenioRecordComposable<any, any>>()
    const route = useRoute()

    const currentUrl = computed(() => props.url || route.path)

    callAndWatch([props.options], () => {
      console.log('record current url', currentUrl.value)
      record.value = useInvenioRecord(
          currentUrl.value,
          {
            ...props.options,
            loadInitial: true
          }
      )
    }, {deep: true})

    watch(currentUrl, (newUrl) => {
      record.value!.setUrl(newUrl)
    })

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
      const rec = record.value
      if (!rec) {
        return null
      }
      if (rec.http.error) {
        return errorComponent
      }
      if (rec.http.data) {
        return viewerComponent
      }
      return loadingComponent
    })

    return {
      record,
      propsAndAttributes: {...props, ...ctx.attrs},
      currentComponent
    }
  }
})
</script>
