/* eslint-disable */
// declare module '*.vue' {
//   import type { DefineComponent } from 'vue'
//   const component: DefineComponent<{}, {}, any>
//   export default component
// }

declare module '@oarepo/quasar-es-facets' {

    const mod: {
        install(app: any): void;
    };

    export default mod
}

