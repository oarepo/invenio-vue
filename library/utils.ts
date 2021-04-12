import {watch} from "vue";


export function callAndWatch(what: any, callback: any, options?: any) {
    watch(what, callback, options)
    callback()
}

const encodeReserveRE = /[!'()*]/g
const encodeReserveReplacer = (c: string) => '%' + c.charCodeAt(0).toString(16)
const commaRE = /%2C/g

const encode = (str: string) =>
    encodeURIComponent(str)
        .replace(encodeReserveRE, encodeReserveReplacer)
        .replace(commaRE, ',')

export function stringifyQuery(obj: any) {
    const res = obj
        ? Object.keys(obj)
            .sort()
            .map(key => {
                const val = obj[key]

                if (val === undefined || val === false) {
                    return ''
                }

                if (val === null) {
                    return ''
                }

                if (val === true) {
                    return encode(key)
                }

                if (val === '') {
                    return ''
                }

                if (Array.isArray(val)) {
                    const result: string[] = []
                    val.forEach(val2 => {
                        if (val2 === undefined) {
                            return
                        }
                        if (val2 === null) {
                            result.push(encode(key))
                        } else {
                            result.push(encode(key) + '=' + encode(val2))
                        }
                    })
                    return result.join('&')
                }

                return encode(key) + '=' + encode(val)
            })
            .filter(x => x.length > 0)
            .join('&')
        : null
    return res ? `?${res}` : ''
}
