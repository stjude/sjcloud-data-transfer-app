import Home from "./components/Home.vue";
import Startup from "./components/Startup.vue";
import NotFound from "./components/NotFound.vue";
import Upload from "./components/Upload.vue";
import Download from "./components/Download.vue";
import Install from "./components/Install.vue";
import LogIn from "./components/LogIn.vue";
import InitialSteps from "./components/InitialSteps.vue";

export default function() {
  return [{
    path: "/home",
    component: Home,
  }, {
    path: "/install",
    component: InitialSteps,
  }, {
    path: "/login",
    component: InitialSteps,
  }, {
    path: "/upload",
    component: Upload,
  }, {
    path: "/download",
    component: Download,
  }, {
    path: "/",
    component: Startup,
  }, {
    path: "*",
    component: NotFound,
  }];
}
