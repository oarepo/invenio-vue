<template>
  <div style="margin: 30px;" class="row q-col-gutter-md">
    <div class="col-8">
      <div>
        <input v-model.lazy="$query.q" placeholder="search..." v-debounce="400">
        <select v-model="$query.sort">
          <option value="alphabetical">sort alphabetically</option>
          <option value="best-match">sort by best match</option>
        </select>
      </div>
      <div v-for="record in collection.records" :key="record.id" style="margin-top: 20px">
        <div v-for="(title, idx) in record.metadata.title || []" :key="idx">
          <b>{{ title.en || title.cs }}</b>
        </div>
        <div>
          <a href="" v-if="!record.more" @click.prevent="record.more=true">more ...</a>
          <div v-else style="margin-top: 20px">
            <table valign="top" cellpadding="5">
              <tr v-for='md in Object.entries(record.metadata)' :key="md[0]">
                <td valign="top">{{ md[0] }}</td>
                <td valign="top">{{ md[1] }}</td>
              </tr>
            </table>
            <a href="" @click.prevent="record.more=false">less ...</a>
          </div>
        </div>
        <hr>
      </div>
      <div style="margin-top: 30px;">
        <a href="" @click.prevent="setPage(page)" v-for="page in pages" :key="page"
           class="paginator"
           :class="{active: page === collection.page}">{{ page }}</a>
      </div>
    </div>
    <div class="col-4">
      <facets
          :definition="collection.facetDefinitions"
          :options="options"
          :facetLoader="facetLoader"
          @facetSelected="facetSelected"
          drawer
      ></facets>
    </div>
  </div>
</template>

<script>
import {Options, Vue} from 'vue-class-component'
import {debounce} from "@/debouncer";

@Options({
  name: "collection",
  props: {
    collection: Object
  },
  directives: {
    debounce: (el, binding) => debounce(el, binding)
  }
})
export default class Collection extends Vue {
  get pages() {
    const ret = []

    let paginationStart = Math.max(1, this.collection.page - 10);
    let paginationEnd = Math.min(this.collection.pages, paginationStart + 20);
    for (let i = paginationStart; i < paginationEnd; i++) {
      ret.push(i)
    }
    return ret
  }

  setPage(page) {
    this.$query.page = page
  }

  async facetLoader(facetSelection, activeFacets, excludedFromQuery /*, extras = {}*/) {
    const fetchedFacets = new Set([...Object.keys(facetSelection.selected()), ...Object.keys(activeFacets)])
    if (!fetchedFacets.size) {
      return {}
    }
    const facets = await this.collection.httpFacets.load({
      query: {
        facets: [...fetchedFacets.values()].join(','),
        ...Object.entries(facetSelection.selected()).reduce(
            (p, s) => {
              if (!(excludedFromQuery && excludedFromQuery.includes(s[0]))) {
                p[s[0]] = [...s[1]].map(x => x.toString())
              }
              return p
            }, {}),
        size: 1
      },
      returnPromise: true
    })
    return facets.aggregations
  }

  facetSelected(facetSelection) {
    for (const [k, v] of Object.entries(facetSelection)) {
      if (!v.size) {
        this.$query[k] = null
      } else {
        this.$query[k] = [...v]
      }
    }
  }
}
</script>
<style>
.paginator {
  display: inline-block;
  padding: 10px;
  min-width: 30px;
  text-align: center;
}

.active {
  border: 1px solid lightgrey;
}
</style>
