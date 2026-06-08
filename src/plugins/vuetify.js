import { ru } from 'vuetify/locale'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'

export default createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#6AB0DE',
          secondary: '#A8E6CF',
          background: '#F8F9FC',
          surface: '#FFFFFF',
          accent: '#FFCF96',
        },
        font: {
          family: 'Inter, sans-serif'
        }
      }
    }
  },
  locale: {
    locale: 'ru',
    messages: { ru },
  },
})
