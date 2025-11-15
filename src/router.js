import { createRouter, createWebHistory } from "vue-router";
import Dashboard from "./pages/Dashboard.vue";
import Samples from "./pages/Sample.vue";
import SampleForm from "./pages/SampleForm.vue";
import Reports from "./pages/Reports.vue";
import Locations from "./pages/Locations.vue";
import LocationDetails from "./pages/LocationDetails.vue";
import SampleDetails from "./pages/SampleDetails.vue";
import Analysis from "./pages/Analysis.vue";
import Login from "./pages/Login.vue";
import Alerts from "./pages/Alerts.vue";

const routerHistory = createWebHistory();

const router = createRouter({
  history: routerHistory,
  routes: [
    {
      path: "/",
      component: Dashboard,
    },
    {
      path: "/samples",
      component: Samples,
    },
    {
      path: "/samples/new",
      name: "NewSample",
      component: SampleForm,
    },
    {
      path: "/samples/:id",
      name: "SampleDetails",
      component: SampleDetails,
    },
    {
      path: "/reports",
      name: "Reports",
      component: Reports,
    },
    {
      path: "/locations",
      name: "Locations",
      component: Locations,
    },
    {
      path: "/locations/:id",
      name: "LocationDetails",
      component: LocationDetails,
    },
    {
      path: "/analysis",
      name: "Analysis",
      component:Analysis,
    },
    {
      path: "/alerts",
      name: "Alerts",
      component: Alerts,
    },
    {
      path: "/login",
      name: "Login",
      component: Login,
    }
  ],
});

export default router;
