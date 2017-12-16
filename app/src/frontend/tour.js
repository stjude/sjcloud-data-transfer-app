import jQueryGlobalizer from './helpers/jQueryGlobalizer';
import boostrap from 'bootstrap';
import Tour from 'bootstrap-tour';

const tour = new window.Tour({
  storage: false,
  container: 'body',
  backdrop: true,
  backdropContainer: 'body',
  smartPlacement: true,
  delay: 100,
  // debug: true,
  steps: [{
    element: '#sjcda-top-bar-menu',
    title: 'Guided Tour',
    content: 'Welcome! See the features of this application.',
    placement: 'left',
    backdrop: false,
    backdropContainer: 'body',
    onShow(tour) {
      if (!window.VueApp) return;
      if (tour.__promptTimeout) {
        clearTimeout(tour.__promptTimeout);
      }
      window.VueApp.$store.commit('toggleMenu');
    },
  }, {
    element: '.left-panel-table-container',
    title: 'Step 1: Select workspace',
    content: `<div>
              Creating a data request or running a tool for the first time
              will create a permanent 'workspace' area in the cloud.
              </div>
              <div>
              For a data request, all of your data will be placed 
              in the workspace that is created.
              </div>
              <div>
              For tools, you will upload your data to the tool's workspace, run the tool
              on that data in the cloud, then download the results 
              from the tool's workspace.
              </div>`,
    backdrop: true,
    backdropContainer: 'body',
    onShow(tour) {
      if (tour.__promptTimeout) {
        clearTimeout(tour.__promptTimeout);
      }
      window.VueApp.$router.replace('/upload');
    },
  }, {
    element: '.right-panel-container',
    title: 'Step 2: Work with files',
    content: `Selecting a workspace in Step 1 will update the
              files shown in the upload/download pane.`,
    backdrop: true,
    backdropContainer: 'body',
    placement: 'left',
    smartPlacement: true,
    onShow(tour) {
      if (tour.__promptTimeout) {
        clearTimeout(tour.__promptTimeout);
      }
      window.VueApp.$router.replace('/upload');
    },
  }, {
    element: '.upload-download-btn-container',
    title: 'Step 2: Work with files (cont.)',
    content: `You can switch between uploading input files
              for tools or downloading results files from either
              your data request or tool workspaces.`,
    backdrop: true,
    backdropContainer: 'body',
    placement: 'left',
    smartPlacement: true,
    onShow(tour) {
      if (tour.__promptTimeout) {
        clearTimeout(tour.__promptTimeout);
      }
      window.VueApp.$router.replace('/upload');
    },
  }, {
    element: '#upload-panel',
    title: 'Step 3a: Upload files',
    content: `After selecting the 'Upload' tab, you can click
              or drag files over the highlighted area to send
              input files to the cloud for processing.`,
    backdrop: true,
    backdropContainer: 'body',
    placement: 'left',
    smartPlacement: true,
    onShow(tour) {
      if (!window.VueApp) return;
      window.VueApp.$router.replace('/upload');
    },
  }, {
    element: '#download-panel',
    title: 'Step 3b: Download files',
    content: `After selecting the 'Download' tab, you can select 
              results files from tools or data included in your
              data requests. Note: if you do not see any files 
              here now, you may have to successfully complete
              running a tool first.`,
    backdrop: true,
    backdropContainer: 'body',
    placement: 'left',
    smartPlacement: true,
    onShow(tour) {
      if (!window.VueApp) return;
      window.VueApp.$router.replace('/download');
    },
  }, {
    element: '.bottom-bar-left',
    title: 'Download location',
    content: `If you'd like to download your results file to somewhere
              other than the default location, click here.`,
    backdrop: true,
    backdropContainer: 'body',
    placement: 'left',
    smartPlacement: true,
    onShow(tour) {
      if (!window.VueApp) return;
      window.VueApp.$router.replace('/download');
    },
  }, {
    element: '.download-btn',
    title: 'Download button',
    content: 'You can download requested St. Jude data or results files to your computer.',
    backdrop: true,
    backdropContainer: 'body',
    placement: 'left',
    smartPlacement: true,
    onShow(tour) {
      if (!window.VueApp) return;
      window.VueApp.$router.replace('/download');
      window.VueApp.$store.commit('closeModal');
    },
  }, {
    element: '#sjcda-top-bar-menu',
    title: 'File a bug report',
    content: 'If you encounter issues, follow the Issues link to contact us.',
    backdrop: true,
    backdropContainer: 'body',
    orphan: true,
    placement: 'left',
    smartPlacement: true,
    onShow(tour) {
      if (!window.VueApp) return;
      // window.VueApp.$router.replace("/upload");
      window.VueApp.$store.commit('closeModal');
      window.VueApp.$store.commit('openMenu');
    },
  }, {
    element: '#sjcda-top-bar-menu',
    title: 'User preferences',
    content: "You can set user preferences by selecting 'Settings' from the drop down menu.",
    backdrop: true,
    backdropContainer: 'body',
    orphan: true,
    placement: 'left',
    onShow(tour) {
      if (tour.__promptTimeout) {
        clearTimeout(tour.__promptTimeout);
      }
      // window.VueApp.$router.replace("/download");
      window.VueApp.$store.commit('closeModal');
      window.VueApp.$store.commit('openMenu');
    },
  }, {
    element: '#left-panel-project-filters',
    title: 'Files and Project Filter Buttons',
    content: 'These filters may be used to show or hide certain projects or files. By default, we focus on St. Jude Cloud projects.',
    backdrop: true,
    backdropContainer: 'body',
    onShow(tour) {
      if (tour.__promptTimeout) {
        clearTimeout(tour.__promptTimeout);
      }
      window.VueApp.$router.replace('/upload');
      window.VueApp.$store.commit('closeMenu');
      window.VueApp.$store.commit('toggleModal');
    },
  }],
  afterGetState(key, value) {
    // console.log(key,value)
  },
  onEnd(tour) {
    if (!window.VueApp) return;
    window.setTimeout(() => window.VueApp.$store.commit('closeMenu'), 200);
    window.setTimeout(() => window.VueApp.$store.commit('closeModal'), 200);
  },
});

let tourInitialized = false;
let waitingForTools = false;
let userPrompted = false;

tour.__promptUser = (path) => {
  if (tourInitialized || userPrompted) return;
  if (path !== '/upload' && path !== '/download') return;
  if (window.location.port === '9876') return;

  userPrompted = true;
  let numTries = 0;

  waitingForTools = setInterval(() => {
    if (!window.VueApp.$store.getters.tools.length) {
      numTries += 1;
      if (numTries > 10) clearInterval(waitingForTools);
      return;
    }
    clearInterval(waitingForTools);
    tourInitialized = true;
    tour.init();
    tour.goTo(0);
    tour.start(true);
    tour.__promptTimeout = setTimeout(() => {
      tour.end();
    }, 5000);
  }, 300);
};

tour.__start = (i = 1) => {
  if (tour.__promptTimeout) {
    clearTimeout(tour.__promptTimeout);
  }

  tourInitialized = true;
  tour.setCurrentStep(i);
  tour.start(true);
};

export default tour;
