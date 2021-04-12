import {shallowMount} from '@vue/test-utils'
import flushPromises from 'flush-promises'
import {toRaw} from 'vue'

import axios from 'axios'
import {useInvenioCollection} from "../";
import {SWRVCache} from "swrv";
import resp1 from './resp1.json'

import MockAdapter from 'axios-mock-adapter'

const mock = new MockAdapter(axios)

export async function sleep(ms) {
    await new Promise((resolve) => setTimeout(() => {
        resolve()
    }, ms))
}

describe('collection load tests', () => {
    beforeEach(() => {
        mock.resetHandlers()
    })

    function setupApi(url) {
        const component = {
            template: '<div></div>',
            setup() {
                return useInvenioCollection(url, {}, {
                    optionsCache: new SWRVCache(),  // do not use local storage in tests
                    cache: new SWRVCache() // different cache for each test
                })
            }
        }
        return shallowMount(component)
    }

    test('load finishes successfully', async () => {
        const wrapper = setupApi('/all/')
        mock.onGet('/all/?page=1&size=10').reply(200, resp1)
        mock.onOptions('/all/').reply(200, {facets: [], filters: {}})
        wrapper.vm.load()
        await flushPromises()
        expect(wrapper.vm.loaded).toBe(true)
        expect(wrapper.vm.records.length).toBe(10)
        expect(wrapper.vm.pageSize).toBe(10)
        expect(wrapper.vm.pages).toBe(3532)
        expect(wrapper.vm.page).toBe(1)
        expect(wrapper.vm.http.query.value).toStrictEqual({size: '10', page: '1', facets: ""})
    })

    test('set page', async () => {
        const wrapper = setupApi('/all/')
        mock.onGet('/all/?page=2&size=10').reply(200, resp1)
        mock.onOptions('/all/').reply(200, {facets: [], filters: {}})
        wrapper.vm.page = 2
        wrapper.vm.load()
        await flushPromises()
        expect(wrapper.vm.loaded).toBe(true)
        expect(wrapper.vm.records.length).toBe(10)
        expect(wrapper.vm.pageSize).toBe(10)
        expect(wrapper.vm.pages).toBe(3532)
        expect(wrapper.vm.page).toBe(2)
        expect(wrapper.vm.http.query.value).toStrictEqual({size: '10', page: '2', facets: ""})
    })

    test('navigate page', async () => {
        const wrapper = setupApi('/all/')
        mock.onGet('/all/?page=1&size=10').reply(200, resp1)
        mock.onGet('/all/?page=2&size=10').reply(200, resp1)
        mock.onOptions('/all/').reply(200, {facets: [], filters: {}})

        wrapper.vm.load()
        await flushPromises()
        expect(wrapper.vm.loaded).toBe(true)
        expect(wrapper.vm.page).toBe(1)

        wrapper.vm.page = 2
        await flushPromises()
        expect(wrapper.vm.loaded).toBe(true)
        expect(wrapper.vm.records.length).toBe(10)
        expect(wrapper.vm.pageSize).toBe(10)
        expect(wrapper.vm.pages).toBe(3532)
        expect(wrapper.vm.page).toBe(2)
        expect(wrapper.vm.http.query.value).toStrictEqual({size: '10', page: '2', facets: ""})
    })
})
