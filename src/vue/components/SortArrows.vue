<template>
	<div style='float:right; position:relative; height:20px; right:20px' @click.stop='toggleSortDirection'>
		<div class='material-icons sjcda-sort-arrow' v-show='direction!=-1 || !isCurrSortKey' style='top:-3px'>
			keyboard_arrow_up
		</div>
		<div class='material-icons sjcda-sort-arrow' v-show='direction!=1 || !isCurrSortKey' style='top:5px;height:15px;'>
			keyboard_arrow_down
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
	font-size:18px; 
	/*vertical-align:middle;*/
	cursor:default;
	position: absolute;
	color:#888;
}
</style>