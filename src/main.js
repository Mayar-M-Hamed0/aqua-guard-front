import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'

// PrimeVue & Components
import PrimeVue from 'primevue/config'
import Select from 'primevue/select';
import InputNumber from 'primevue/inputnumber';
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button';
import Dialog from 'primevue/dialog'
import Calendar from 'primevue/calendar'
import InputText from 'primevue/inputtext'
import Tag from 'primevue/tag'
import Badge from 'primevue/badge'
import FileUpload from 'primevue/fileupload'
import ConfirmDialog from 'primevue/confirmdialog'
import ConfirmationService from 'primevue/confirmationservice'
import ToastService from 'primevue/toastservice'
import Toast from 'primevue/toast'
import Tooltip from 'primevue/tooltip'
import Aura from '@primeuix/themes/aura';
import ProgressBar from 'primevue/progressbar';
import ProgressSpinner from 'primevue/progressspinner';
import SelectButton from 'primevue/selectbutton';
import Divider from 'primevue/divider';
import Textarea from 'primevue/textarea';

import 'primeicons/primeicons.css'

// Leaflet CSS
import 'leaflet/dist/leaflet.css'

// Custom CSS
import './css/style.css'

// Create App
const app = createApp(App)
app.use(router)
app.use(createPinia())

// PrimeVue setup
app.use(PrimeVue, {
    theme: {
        preset: Aura
    }
});

app.use(ConfirmationService)
app.use(ToastService)

// Register Global Components
app.component('Button', Button)
app.component('DataTable', DataTable)
app.component('Column', Column)
app.component('Select', Select)
app.component('Dialog', Dialog)
app.component('Calendar', Calendar)
app.component('InputNumber', InputNumber)
app.component('InputText', InputText)
app.component('Tag', Tag)
app.component('Badge', Badge)
app.component('FileUpload', FileUpload)
app.component('ConfirmDialog', ConfirmDialog)
app.component('Toast', Toast)
app.component('ProgressBar', ProgressBar)
app.component('ProgressSpinner', ProgressSpinner)
app.component('SelectButton', SelectButton)
app.component('Divider', Divider)
app.component('Textarea', Textarea)

// Tooltip Directive
app.directive('tooltip', Tooltip)

app.mount('#app')
