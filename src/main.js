import { createApp } from 'vue';
import { createPinia } from 'pinia';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
dayjs.locale('ru');

import App from './App.vue';
import vuetify from './plugins/vuetify';
import router from './router';
import './assets/styles/main.scss';

const app = createApp(App);

app.use(createPinia());
app.use(vuetify);
app.use(router);

app.mount('#app');
