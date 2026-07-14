import { mount } from 'svelte'
import { registerSW } from 'virtual:pwa-register'
import '@fontsource-variable/bricolage-grotesque/index.css'
import './app.css'
import App from './App.svelte'

// Offline-first service worker; new versions activate on next launch.
registerSW({ immediate: true })

const app = mount(App, {
  target: document.getElementById('app')!,
})

export default app
