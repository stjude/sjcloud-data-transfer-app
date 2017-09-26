import {select, selectAll, event} from 'd3-selection';
import './www-init.js';
import '../app/bin/frontend/app.bundle.css';
import _App from '../app/src/frontend/vue/main.js';

describe('LeftPanel for a user with projects', function () {
	const holder=select('body').append('div');
	holder.append('div').attr('id','leftaaa');
	let app;
	beforeAll(function (done) {
		app=_App('#leftaaa');
		app.$router.push('/download');
		 // note: simulated data load is delayed by 500 ms
		setTimeout(()=>{
			app.$store.commit('setCurrToolName','x2');
			done()
		},600);
	});

	it('should have the correct # of rows for tools', function (done) {
		expect(holder.selectAll('tr').size()).toEqual(12);
		done();
	});

	it('should have the correct # of rows for sj tools', function (done) {
		expect(holder.selectAll('tr .badge')
			.filter(function(b){return this.style.display!='none'})
			.size()
		).toEqual(1);
		done();
	});

	afterAll(function(done) {
		holder.remove();
		done();
	});
});
