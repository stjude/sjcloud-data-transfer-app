import {select, selectAll, event} from 'd3-selection';
import './www-init.js';
import '../app/bin/backend/all.js';
import '../app/bin/frontend/app.bundle.css';
import _App from '../app/src/frontend/vue/main.js';

describe('LeftPanel for a user with projects', function () {
	const holder=select('body').append('div');
	holder.append('div').attr('id','leftaaa');
	let app;
	beforeAll(function (done) {
		window.testdata='fakeTools';
		app=_App('#leftaaa',{"showAllFiles":true,"showAllProjects":true});
		app.$router.push('/download');
		 // note: simulated data load is delayed by 500 ms
		setTimeout(()=>{
			app.$store.commit('setCurrToolName','x2');
			done()
		},1600);
	});

	it('should have the correct # of rows for tools', function (done) {
		setTimeout(()=>{
			expect(holder.select('#fileStatusDiv').selectAll('tr').size()).toEqual(10);
			done();
		},300);
	});

	it('should have the correct # of rows for sj tools', function (done) {
		setTimeout(()=>{
			expect(holder.selectAll('tr .badge')
				.filter(function(b){return this.style.display!='none'})
				.size()
			).toEqual(1);
			done();
		},500);
	});

	afterAll(function(done) {
		//holder.remove();
		done();
	});
});
