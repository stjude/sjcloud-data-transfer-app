import {select, selectAll, event} from 'd3-selection';
import './www-init.js';
import '../app/bin/backend/all.js';
import '../app/bin/frontend/app.bundle.css';
import _App from '../app/src/frontend/vue/main.js';

describe('NavBar search', function () {
	const holder=select('body').append('div');
	holder.append('div').attr('id','navbaraaa');
	let app
	beforeAll(function (done) {
		window.testdata='fakeTools';
		app=_App('#navbaraaa');
		app.$router.push('/download');
		// note: simulated data load is delayed by 500 ms
		setTimeout(()=>{
			app.$store.commit('setCurrToolName','x4');
			done()
		},600);
	});

	it('should display 10 rows for term=_c', function (done) {
		const searchTerm='_c';
		holder.select('#sjcda-nav-search-bar').property('value',searchTerm);
		window.VueApp.$store.commit('setSearchTerm',searchTerm);
		setTimeout(()=>{
			expect(holder.selectAll('#fileStatusDiv table tr').size()).toEqual(7);
			done();
		},50)
	});

	afterAll(function(done) {
		select('#aaa').remove();
		done();
	});
});
