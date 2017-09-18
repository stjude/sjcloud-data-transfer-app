import {select, selectAll, event} from 'd3-selection';
import './www-init.js';
import '../app/bin/frontend/app.bundle.css';
import _App from '../src/vue/main.js';

describe('NavBar search', function () {
	const holder=select('body').append('div').attr('id','aaa');
	let app
	beforeAll(function (done) {
		app=_App('#aaa');
		app.$router.push('/download');
		app.$store.commit('setCurrToolName','Tool-Long-List');
		 // note: simulated data load is delayed by 500 ms
		setTimeout(()=>done(),600);
	});

	it('should display 10 rows for term=_c', function (done) {
		select('#sjcda-nav-search-bar').property('value','_c').node().change();
		expect(selectAll('#fileStatusDiv table tr').size()).toEqual(1);
		done();
	});

	afterAll(function(done) {
		select('#aaa').remove();
		done();
	});
});
