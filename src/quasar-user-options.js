import './styles/quasar.sass'
import '@quasar/extras/roboto-font/roboto-font.css'
import '@quasar/extras/material-icons/material-icons.css'
import {
    Dialog,
    QBadge,
    QBtn,
    QCheckbox,
    QChip,
    QExpansionItem,
    QItem,
    QItemSection,
    QList,
    QTab,
    QTabs,
    QTooltip
} from "quasar";

// To be used on app.use(Quasar, { ... })
export default {
    config: {},
    plugins: {
        Dialog
    },
    components: [
        QExpansionItem, QList, QItem,
        QItemSection, QBadge, QCheckbox,
        QTabs, QTab, QBtn, QChip, QTooltip
    ]
}
