<template>
  <div class='sjcda-top-bar unselectable'>
    <div class='sjcda-top-bar__logo_container'>
      <img class="sjcda-top-bar__logo"
           src="../assets/img/stjude-logo-child-white.png"
           @click.stop='goHome'>
    </div>
      <div class="sjcda-title-container">
        <span class="title-font" @click.stop='goHome'>St. Jude Cloud</span>
        <span class="title-font-thin" @click.stop='goHome'>Platform</span>
      </div>
      <div class='material-icons' 
        style='float:right; margin: 10px 10px 0 0'
        @click.stop='toggleMenu'>
        view_headline
      </div>
      <!-- <div v-show='showTourBtn'
        class='tour-prompt'
        @click='tour'>
        <q-btn color='secondary' small>Tour</q-btn>
      </div> -->
  </div>
</template>

<script>
import { QBtn } from 'quasar';
import tour from '../assets/js/tour.js';

export default {
  components: {
    QBtn,
  },
  computed: {
    // showTourBtn() {
    //   return this.$route.path == '/download' || this.$route.path == '/upload';
    // },
  },
  methods: {
    goHome() {
      if (this.$store.getters.environment === 'development') {
        this.$router.replace('/home');
      } else {
        console.error("Tried to go home, but we are not in 'dev' mode!");
      }
    },
    toggleMenu() {
      this.$store.commit('toggleMenu');
    },
    tour() {
      this.$store.commit('closeMenu');
      tour.__start();
    },
  },
};
</script>

<style scoped>
.sjcda-top-bar {
  /* background-color: #2A8BB6; */
  background-color: #1381b3;
  border-width: 3px;
  border-style: solid;
  border-color: #1381b3;
  color: #ffffff;
  cursor: default;
  display: inline-block;
  font-family: 'Open Sans', 'Lato', 'Helvetica Neue', Helvetica, Arial,
    sans-serif;
  font-size: 22px;
  height: 60px;
  padding-top: 0.3rem;
  vertical-align: top;
  width: 100%;
  vertical-align: middle;
}

.sjcda-top-bar__logo_container {
  display: inline-block;
  margin-left: 2px;
}

.sjcda-top-bar__logo {
  margin-top: 2px;
  padding: 5px;
  padding-right: 8px;
  height: 47px;
  border-right: 1px solid #7dbad5;
}

.sjcda-title-container {
  display: inline;
  margin-left: 15px;
  margin-top: 7px;
}

.title-font {
  font-weight: 800;
}

.title-font-thin {
  font-weight: 300;
  color: #a1cde1;
}

.tour-prompt {
  float: right;
  margin: 4px 15px 0px 0px;
}

.q-btn-small {
  min-height: 18px;
  font-weight: 600;
}

/* override color for the tour button */
.bg-secondary {
  background: #00be19 !important;
}
</style>
