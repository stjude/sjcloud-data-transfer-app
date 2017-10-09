import {select, selectAll, event} from 'd3-selection';
import './www-init.js';
import '../app/bin/backend/all.js';
import '../app/bin/frontend/app.bundle.css';
import _App from '../app/src/frontend/vue/main.js';

describe('Upload panel for an empty project', function () {
	const holder=select('body').append('div')
	holder.append('div').attr('id','uploadaaa');
	let app
	beforeAll(function (done) {
		app=_App('#uploadaaa',{
			testdata:'fakeTools',
			showAllFiles:true,
			showAllProjects:true
		});
		app.$router.push('/upload');
		setTimeout(()=>{
			app.$store.commit('setCurrToolName','x1');
			done()
		},600);
	});

	it('should not display spinkit', function (done) {
		expect(selectAll('.sk-circle').size()).toEqual(0);
		done();
	});

	it('should show a drop-zone for uploads', function (done) {
		app.$router.push('/upload');
		setTimeout(()=>{
			expect(holder.selectAll('.dropzone').size()).toEqual(1);
			done();
		},600);
	});

	afterAll(function(done) {
		holder.remove();
		done();
	});
});

describe('Upload panel for a project with completed transfer', function () {
	const holder=select('body').append('div')
	holder.append('div').attr('id','uploadccc');
	let app
	
	beforeAll(function (done) {
		app=_App('#uploadccc',{
			testdata:'fakeTools',
			showAllFiles:true,
			showAllProjects:true
		});
		app.$router.push('/upload');
		 // note: simulated data load is delayed by 500 ms
		setTimeout(()=>{
			app.$store.commit('setCurrToolName','x3');
			done()
		},600);
	});

	it('should display a completion message', function (done) {
		expect(holder
			.selectAll('.sjcda-step-outcome-root-div')
			.selectAll('.material-icons')
			.filter(function(d){
				return select(this).html().trim()=='done'
			})
			.size())
		.toEqual(1);
		
		done();
	});

	it('should display two buttons', function (done) {
		setTimeout(()=>{
			expect(holder
				.selectAll('button')
				.selectAll('.material-icons')
				.filter(function(d){
					const html=select(this).html().trim();
					return html=='cloud_upload' || html=='open_in_browser'
				})
				.size())
			.toEqual(2);
		});
		
		done();
	});

	afterAll(function() {
		holder.remove();
	});
});

