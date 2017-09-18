import {select, selectAll, event} from 'd3-selection';
import './www-init.js';
import '../app/bin/frontend/app.bundle.css';
import _App from '../src/vue/main.js';

describe('LeftPanel for a user with projects', function () {
	const holder=select('body').append('div').attr('id','aaa');
	let app
	beforeAll(function (done) {
		app=_App('#aaa');
		app.$router.push('/download');
		app.$store.commit('setCurrToolName','Tool-Empty');
		 // note: simulated data load is delayed by 500 ms
		setTimeout(()=>done(),600);
	});

	it('should have the correct # of rows for tools', function (done) {
		expect(selectAll('.left-panel-table-container tr').size()).toEqual(12);
		done();
	});

	it('should have the correct # of rows for sj tools', function (done) {
		expect(selectAll('.left-panel-table-container tr .badge')
			.filter(function(b){return this.style.display!='none'})
			.size()
		).toEqual(1);
		done();
	});

	afterAll(function(done) {
		select('#aaa').remove();
		done();
	});
});
