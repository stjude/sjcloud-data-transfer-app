import {select, selectAll, event} from 'd3-selection';
import './www-init.js';
import '../app/bin/frontend/app.bundle.css';
import _App from '../src/vue/main.js';

describe('Download panel for an empty project', function () {
	const holder=select('body').append('div').attr('id','aaa');
	let app;
	beforeAll(function (done) {
		app=_App('#aaa');
		app.$router.push('/download');
		app.$store.commit('setCurrToolName','Tool-Empty');
		 // note: simulated data load is delayed by 500 ms
		setTimeout(()=>done(),600);
	});

	it('should not display spinkit', function (done) {
		expect(selectAll('.sk-circle').size()).toEqual(0);
		done();
	});

	/*it('should show a drop-zone for uploads', function (done) {
		app.$router.push('/upload');
		setTimeout(()=>{
			expect(selectAll('.dropzone').size()).toEqual(1);
			done();
		},600);
	});*/

	afterAll(function(done) {
		select('#aaa').remove();
		done();
	});
});

describe('Download panel for a project with completed transfer', function () {
	const holder=select('body').append('div').attr('id','ccc');
	let app;
	
	beforeAll(function (done) {
		app=_App('#ccc');
		app.$router.push('/download');
		app.$store.commit('setCurrToolName','Tool-Completed');
		 // note: simulated data load is delayed by 500 ms
		setTimeout(()=>done(),600);
	});

	it('should have 2 completed icons for downloads', function (done) {
		expect(select('#sjcda-file-table-body')
			.selectAll('.cellStatus .material-icons')
			.filter(function(d){
				return select(this).html()=='check_circle'
			})
			.size())
		.toEqual(2);
		
		done();
	});

	afterAll(function() {
		select('#ccc').remove();
	});
});
