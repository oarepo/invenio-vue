import {createRouter, createWebHistory} from 'vue-router'
import Home from '../views/Home.vue'
import {collection, record} from "@oarepo/invenio-vue";

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home
    },
    collection({
        path: '/all/',
        name: 'all',
        component: () => import('../views/Collection.vue')
    }),
    record({
        path: '/:communityId/:model/:state/:recordId',
        name: 'record',
        component: () => import('../views/Record.vue')
    }),
    {
        path: '/about',
        name: 'About',
        component: () => import('../views/About.vue')
    }
]

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes
})

export default router
