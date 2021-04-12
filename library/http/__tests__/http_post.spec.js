import {shallowMount} from '@vue/test-utils'
import flushPromises from 'flush-promises'

import axios from 'axios'
import {useHttp} from "../";
import {SWRVCache} from "swrv";

import MockAdapter from 'axios-mock-adapter'

const mock = new MockAdapter(axios)

export async function sleep(ms) {
    await new Promise((resolve) => setTimeout(() => {
        resolve()
    }, ms))
}

describe('http load tests', () => {
    beforeEach(() => {
        mock.resetHandlers()
    })

    function setupApi(url) {
        const component = {
            template: '<div></div>',
            setup() {
                return useHttp(url, {},{
                    errorRetryInterval: 200,
                    errorRetryCount: 1,
                    cache: new SWRVCache() // different cache for each test
                })
            }
        }
        return shallowMount(component)
    }

    test('simple_post', async () => {
        const wrapper = setupApi('/')
        mock.onPost('/', {
            test: true
        }).reply(201, {test: true, id: 1}, {
            Location: '/1'
        })
        const data = await wrapper.vm.post({
            data: {test: true},
            replaceContent: true
        })
        await flushPromises()

        expect(wrapper.vm.data).toStrictEqual({test: true, id: 1})
        expect(wrapper.vm.url).toEqual("/1")
    })
})
