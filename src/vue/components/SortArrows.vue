<template>
	<div style='float:right; position:relative; height:20px; right:20px' @click.stop='toggleSortDirection'>
		<div class='material-icons sjcda-sort-arrow' v-show='direction!=-1 || !isCurrSortKey' style='top:-3px; transform:rotate(-90deg)'>
			play_arrow
		</div>
		<div class='material-icons sjcda-sort-arrow' v-show='direction!=1 || !isCurrSortKey' style='top:6px; height:15px; transform:rotate(90deg);'>
			play_arrow
		</div>
	</div>	
</template>

<script>
const sortTracker={}
/*
Expects a vuex-store with a mutation function for 
setFileSorting with a key and direction property
*/
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
	font-size:16px; 
	/*vertical-align:middle;*/
	cursor:default;
	position: absolute;
	color:#aaa;
}
</style>