<template>
  <table valign="top" cellpadding="5">
    <tr v-for='md in Object.entries(record.metadata)' :key="md[0]">
      <td valign="top">{{ md[0] }}</td>
      <td valign="top" v-if="isJSON(md[1])">
        <pre>{{ md[1] }}</pre>
      </td>
      <td valign="top" v-else>{{ md[1] }}</td>
    </tr>
  </table>

</template>
<script>
import {Options, Vue} from 'vue-class-component'

@Options({
  name: "record",
  props: {
    record: Object
  }
})
export default class Collection extends Vue {
  isJSON(x) {
    return x && Array.isArray(x) || typeof x === 'object'
  }
}
</script>
