import {select, selectAll, event} from 'd3-selection';
import './www-init.js';
import '../app/bin/frontend/app.bundle.css';
import _App from '../src/vue/main.js';

describe('FileStatus table for an empty project', function () {
	const holder=select('body').append('div').attr('id','aaa');
	let app
	beforeAll(function (done) {
		app=_App('#aaa');
		app.$router.push('/download');
		app.$store.commit('setCurrToolName','Tool-Empty');
		 // note: simulated data load is delayed by 500 ms
		setTimeout(()=>done(),600);
	});

	it('should not be displayed', function (done) {
		expect(select('#fileStatusDiv').node()).toEqual(null);
		done();
	});

	it('should show a drop-zone for uploads', function (done) {
		app.$router.push('/upload');
		setTimeout(()=>{
			expect(select('#aaa').selectAll('.dropzone').size()).toEqual(1);
			done();
		},600);
	});

	afterAll(function(done) {
		select('#aaa').remove();
		done();
	});
});

describe('FileStatus table for a project with pending downloads', function () {
	const holder=select('body').insert('div','#aaa').attr('id','bbb');
	let app
	
	beforeAll(function (done) {
		app=_App('#bbb');
		app.$router.push('/download');
		app.$store.commit('setCurrToolName','Tool-Loading');
		 // note: simulated data load is delayed by 500 ms
		setTimeout(()=>done(),600);
	});

	it('should be displayed', function (done) {
		expect(select('#fileStatusDiv').size()).toEqual(1);
		done();
	});

	it('should have 9 rows of listed files', function (done) {
		expect(select('#sjcda-file-table-body').selectAll('tr').size()).toEqual(9);
		done();
	});

	it('should have 2 empty status cells', function (done) {
		expect(select('#sjcda-file-table-body')
			.selectAll('.cellStatus')
			.filter(function(d){
				return !this.innerHTML || this.innerHTML=='<!---->'
			})
			.size())
		.toEqual(2);
		
		done();
	});

	it('should have 1 starting status cells', function (done) {
		expect(select('#sjcda-file-table-body')
			.selectAll('.cellStatus')
			.filter(function(d){
				return select(this).selectAll('div').size()==1 && 
					select(this).selectAll('div').html()=='Starting...'
			})
			.size())
		.toEqual(1);
		
		done();
	});

	it('should have 4 in-progress status cells', function (done) {
		expect(select('#sjcda-file-table-body')
			.selectAll('.cellStatus .sjcda-progress-outline')
			.size())
		.toEqual(4);
		
		done();
	});

	it('should have 2 completed status cells', function (done) {
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
		select('#bbb').remove();
	});
});

describe('FileStatus table for a project with completed transfer', function () {
	const holder=select('body').append('div').attr('id','ccc');
	let app
	
	beforeAll(function (done) {
		app=_App('#ccc');
		app.$router.push('/download');
		app.$store.commit('setCurrToolName','Tool-Loading');
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

	it('should not be displayed for uploads', function (done) {
		app.$router.push('/upload');
		expect(select('#ccc').select('#fileStatusDiv').node()).toEqual(null);
		done();
	});

	afterAll(function() {
		select('#ccc').remove();
	});
});

