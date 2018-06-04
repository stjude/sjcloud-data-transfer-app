<template>
	<div class='sort-arrow-div' @click.stop='toggleSortDirection'>
		<div id="sort-arrow-top"
         class='material-icons sjcda-sort-arrow'
         v-show='direction != -1 || !isCurrSortKey'>
			arrow_drop_up
		</div>
		<div id="sort-arrow-bottom"
         class='material-icons sjcda-sort-arrow'
         v-show='direction != 1 || !isCurrSortKey'>
			arrow_drop_down
		</div>
	</div>	
</template>

<script>
/*
This vue template expects a vuex-store with a mutation 
function of setFileSorting that expects key and direction 
values
*/

const sortTracker={}
export default {
	data() {
		return {
			direction: 0
		}
	},
	props: [
		"sortkey"
	],
	computed: {
		isCurrSortKey() {
			return this.sortkey==this.$store.getters.currFileSortKey
		}
	},
	methods: {
		toggleSortDirection() {
			if (!(this.sortkey in sortTracker)) {
				sortTracker[this.sortkey]=1
			}

			sortTracker[this.sortkey] = -1*sortTracker[this.sortkey];  
			this.direction=sortTracker[this.sortkey];

			this.$store.commit('setFileSorting',{
				key: this.sortkey,
				direction: this.direction
			})
		}
	}
}
</script>

<style>
.sjcda-sort-arrow {
	font-size:24px; 
	vertical-align:top !important;
	cursor:default;
	position: absolute;
	color:#aaa;
}

.sort-arrow-div {
  float: right;
  position: relative;
  height: 20px;
  right: 20px;
}

#sort-arrow-top {
  top: -5px;
}

#sort-arrow-bottom {
  top: 5px;
  height: 15px;
}
</style>