<template>
  <div class="invenio-error-loading-page" v-if="err">
    <h3>{{ title }}</h3>
    <div v-if="err.type === 'unknown'">
      <h4>Unknown error</h4>
      <pre>
        {{ error.raw }}
      </pre>
    </div>
    <div v-else-if="err.type === 'responseMissing'">
      <h4>No response from server</h4>
      The request has not been delivered to the server due to network error
      or the server has not responded in time.
    </div>
    <div v-else-if="err.type === 'unauthorized'">
      <h4>Unauthorized</h4>
      The server says you have no rights to access the resource
    </div>
    <div v-else-if="err.type === 'clientError'">
      <h4>The client send invalid data</h4>
      The client has sent invalid data. Details:
      <div v-html="err.reason" v-if="hasHtmlError"></div>
      <pre v-else>{{ err.reason }}</pre>
    </div>
    <div v-else-if="err.type === 'serverError'">
      <h4>Server error</h4>
      The server experienced error during handling your request.
      <div v-html="err.reason" v-if="hasHtmlError"></div>
      <pre v-else>{{ err.reason }}</pre>
    </div>
    <button class="reload" @click.prevent="reload" v-if="reload">Reload</button>
  </div>
</template>
<script>
import { computed, defineComponent } from 'vue'

export default defineComponent({
  name: 'simple-error',
  props: {
    collection: {
      type: Object,
      required: true
    },
    title: {
      type: String,
      default: 'Error loading data'
    }
  },
  setup(props) {
    const hasHtmlError = computed(() => {
      return props.collection.http.error &&
          props.collection.http.error.reason &&
          (typeof props.collection.http.error.reason === 'string')
    })
    return { err: props.collection.http.error, hasHtmlError }
  }
})
</script>
