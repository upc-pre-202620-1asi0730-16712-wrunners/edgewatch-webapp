import {createApp} from "vue";
import "./style.css";
import App from "./app.vue";
import i18n from "./i18n.js";
import pinia from "./pinia.js";
import router from "./router.js";
import PrimeVue from "primevue/config";
import Material from "@primeuix/themes/material";
import "primeflex/primeflex.css";
import "primeicons/primeicons.css";
import {
    Button, Card, Checkbox, Chip, Column, ConfirmDialog, ConfirmationService, DataTable, DatePicker, Dialog, Drawer,
    FloatLabel, IconField, InputIcon, InputNumber, InputText, Menu, Menubar, Message, MultiSelect, Password,
    RadioButton, Select, SelectButton, Stepper, StepList, StepPanels, Step, StepPanel, Tab, TabList, TabPanel,
    TabPanels, Tabs, Tag, Textarea, Toast, ToastService, Toolbar, Tooltip, Accordion, AccordionPanel,
    AccordionHeader, AccordionContent, Listbox
} from "primevue";

createApp(App)
    .use(i18n)
    .use(PrimeVue, {ripple: true, theme: {preset: Material}})
    .use(ConfirmationService)
    .use(ToastService)
    .component("pv-button", Button)
    .component("pv-card", Card)
    .component("pv-checkbox", Checkbox)
    .component("pv-chip", Chip)
    .component("pv-column", Column)
    .component("pv-confirm-dialog", ConfirmDialog)
    .component("pv-data-table", DataTable)
    .component("pv-date-picker", DatePicker)
    .component("pv-dialog", Dialog)
    .component("pv-drawer", Drawer)
    .component("pv-float-label", FloatLabel)
    .component("pv-icon-field", IconField)
    .component("pv-input-icon", InputIcon)
    .component("pv-input-number", InputNumber)
    .component("pv-input-text", InputText)
    .component("pv-listbox", Listbox)
    .component("pv-menu", Menu)
    .component("pv-menubar", Menubar)
    .component("pv-message", Message)
    .component("pv-multi-select", MultiSelect)
    .component("pv-password", Password)
    .component("pv-radio-button", RadioButton)
    .component("pv-select", Select)
    .component("pv-select-button", SelectButton)
    .component("pv-stepper", Stepper)
    .component("pv-step-list", StepList)
    .component("pv-step-panels", StepPanels)
    .component("pv-step", Step)
    .component("pv-step-panel", StepPanel)
    .component("pv-tabs", Tabs)
    .component("pv-tab-list", TabList)
    .component("pv-tab", Tab)
    .component("pv-tab-panels", TabPanels)
    .component("pv-tab-panel", TabPanel)
    .component("pv-accordion", Accordion)
    .component("pv-accordion-panel", AccordionPanel)
    .component("pv-accordion-header", AccordionHeader)
    .component("pv-accordion-content", AccordionContent)
    .component("pv-tag", Tag)
    .component("pv-textarea", Textarea)
    .component("pv-toast", Toast)
    .component("pv-toolbar", Toolbar)
    .directive("tooltip", Tooltip)
    .use(pinia)
    .use(router)
    .mount("#app");