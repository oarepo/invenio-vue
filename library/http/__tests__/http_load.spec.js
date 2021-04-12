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
                return useHttp(url, {}, {
                    errorRetryInterval: 200,
                    errorRetryCount: 1,
                    cache: new SWRVCache() // different cache for each test
                })
            }
        }
        return shallowMount(component)
    }

    test('load finishes successfully', async () => {
        const wrapper = setupApi()
        mock.onGet().replyOnce(200, {status: 'ok'})
        wrapper.vm.load({url: 'https://unknown-repo.cz/api/1/ok'})
        await flushPromises()
        expect(wrapper.vm.data).toStrictEqual({status: 'ok'})
    })

    test('reload works', async () => {
        const wrapper = setupApi()

        mock.onGet()
            .replyOnce(200, {status: 'ok'})
            .onGet()
            .replyOnce(200, {status: 'ok 2'})
        wrapper.vm.load({url: 'https://unknown-repo.cz/api/1/ok'})
        await flushPromises()
        expect(wrapper.vm.data).toStrictEqual({status: 'ok'})

        wrapper.vm.reload()
        await flushPromises()
        expect(wrapper.vm.data).toStrictEqual({status: 'ok 2'})
    })

    test('load fails on generic error', async () => {
        const wrapper = setupApi()
        mock.onGet().abortRequest()
        wrapper.vm.load({url: 'https://unknown-repo.cz/api/1/error'})
        await flushPromises()
        expect(wrapper.vm.error).toStrictEqual({
            type: 'unknown',
            rawError: new Error('Request aborted')
        })
    })

    test('automatic reload after error', async () => {
        const wrapper = setupApi()
        mock.onGet()
            .abortRequestOnce()
            .onGet()
            .reply(200, {status: 'ok'})
        wrapper.vm.load({url: 'https://unknown-repo.cz/api/1/error'})
        await flushPromises()
        expect(wrapper.vm.error).toStrictEqual({
            type: 'unknown',
            rawError: new Error('Request aborted')
        })
        await sleep(300)
        expect(wrapper.vm.error).toBeUndefined()
        expect(wrapper.vm.data).toStrictEqual({status: 'ok'})
    })

    test('http 404', async () => {
        const wrapper = setupApi()
        mock.onGet().reply(404, 'Page not found')

        wrapper.vm.load({url: 'https://unknown-repo.cz/api/1/error'})
        await flushPromises()
        expect(wrapper.vm.error.type).toBe('clientError')
        expect(wrapper.vm.error.reason).toBe('Page not found')
        expect(wrapper.vm.error.status).toBe(404)
    })

    test('http 403', async () => {
        const wrapper = setupApi()
        mock.onGet().reply(403, 'Forbidden')

        wrapper.vm.load({url: 'https://unknown-repo.cz/api/1/error'})
        await flushPromises()
        expect(wrapper.vm.error.type).toBe('unauthorized')
        expect(wrapper.vm.error.reason).toBe('Forbidden')
        expect(wrapper.vm.error.status).toBe(403)
    })
})
