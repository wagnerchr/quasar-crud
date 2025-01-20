import type { RouteRecordRaw } from 'vue-router';
import TablePage from 'src/pages/Table.vue';


const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: TablePage,
  },
  {
    path: '/users',
    component: TablePage,
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
