import jQueryGlobalizer from "./helpers/jQueryGlobalizer";
import boostrap from "bootstrap";
import Tour from "bootstrap-tour";

const tour = new window.Tour({
  storage: false,
  container: "body",
  backdrop: true,
  	backdropContainer: "body",
  smartPlacement: true,
  // debug: true,
  steps: [{
    element: "#tour-btn",
    title: "Guided Tour",
    content: "Welcome! See the features of this application.",
    placement: "bottom",
    backdrop: false,
  		backdropContainer: "body",
  		onShow(tour) {
  			if (!window.VueApp) return;
  			if (tour.__promptTimeout) {
        clearTimeout(tour.__promptTimeout);
      };
  			window.VueApp.$router.replace("/download");
  		},
  }, {
    element: ".left-panel-table-container",
    title: "Project List",
    content: "Each tool and data request gets its own project.",
    backdrop: true,
  		backdropContainer: "body",
  		onShow(tour) {
  			if (tour.__promptTimeout) {
        clearTimeout(tour.__promptTimeout);
      };
      window.VueApp.$router.replace("/download");
  		},
  }, {
    element: "#left-panel-project-filters",
    title: "Files and Project Filter Buttons",
    content: "These filters may be used to show or hide certain projects or files. By default, we focus on St. Jude Cloud projects.",
    backdrop: true,
  		backdropContainer: "body",
  		onShow(tour) {
  			if (tour.__promptTimeout) {
        clearTimeout(tour.__promptTimeout);
      };
      window.VueApp.$router.replace("/download");
  		},
  }, {
    element: ".right-panel-container",
    title: "Matching Project Files",
    content: "These files depend on the selected project and filters in the left panel.",
    backdrop: true,
  		backdropContainer: "body",
  		placement: "left",
  		smartPlacement: true,
  		onShow(tour) {
  			if (tour.__promptTimeout) {
        clearTimeout(tour.__promptTimeout);
      };
      window.VueApp.$router.replace("/download");
  		},
  }, {
    element: ".download-btn",
    title: "Download Button",
    content: "You can download requested St. Jude data or results files to your computer.",
    backdrop: true,
  		backdropContainer: "body",
  		placement: "left",
  		smartPlacement: true,
  		onShow(tour) {
  			if (!window.VueApp) return;
  			window.VueApp.$router.replace("/download");
  		},
  }, {			 // "#downloadTextInput"
    element: ".bottom-bar-left", // "#downloadTextInput",
    title: "Download Location",
    content: "You can change where to download files.",
    backdrop: true,
  		backdropContainer: "body",
  		placement: "left",
  		smartPlacement: true,
  		onShow(tour) {
  			if (!window.VueApp) return;
  			window.VueApp.$router.replace("/download");
  		},
  }, {
    element: ".right-panel-container",
    title: "Upload Files",
    content: "You can click and drag files over this pane to upload them to the selected project.",
    backdrop: true,
  		backdropContainer: "body",
  		placement: "left",
  		smartPlacement: true,
  		onShow(tour) {
  			if (!window.VueApp) return;
  			window.VueApp.$router.replace("/upload");
  		},
  }, {
    element: "#issues-btn",
    title: "File A Bug Report",
    content: "If you encounter issues, please file a bug report.",
    backdrop: true,
  		backdropContainer: "body",
  		placement: "left",
  		smartPlacement: true,
  }],
  afterGetState: function(key, value) {
    // console.log(key,value)
  },
});

let tourInitialized=false;
tour.__promptUser = (path)=>{
  if (tourInitialized ) return;
  if (path!=="/upload" && path!=="/download") return;
  if (window.location.port=="9876") return;

  setTimeout(()=>{
    tourInitialized=true;
    tour.init();
    tour.goTo(0);
    tour.start(true);
    tour.__promptTimeout=setTimeout(()=>{
      tour.end();
    }, 4000);
  }, 300);
};

tour.__start = ()=>{
  if (tour.__promptTimeout) {
    clearTimeout(tour.__promptTimeout);
  };
  tourInitialized=true;
  tour.setCurrentStep(1);
  tour.start(true);
};

export default tour;
