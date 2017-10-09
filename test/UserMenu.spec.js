import {select, selectAll, event} from 'd3-selection';
import './www-init.js';
import '../app/bin/backend/all.js';
import '../app/bin/frontend/app.bundle.css';
import _App from '../app/src/frontend/vue/main.js';

describe("User Menu's logout button", function () {
	const holder=select('body').append('div');
	holder.append('div').attr('id','usermenuaaa');
	let app;

	beforeAll(function (done) {
		app=_App('#usermenuaaa',{
			testdata:'fakeTools',
			showAllFiles:true,
			showAllProjects:true
		});
		app.$router.push('/download');
		 // note: simulated data load is delayed by 500 ms
		setTimeout(()=>{
			app.$store.commit('setCurrToolName','x2');
			done()
		},500);
	});

	it('should trigger the emptying and replacement of the state.tools array when clicked', function (done) {
		const numRowsBeforeLogut=holder.selectAll('#sjcda-left-panel-table-body tr').size();
		holder.select('#logout-btn').node().click();
		app.$store.commit('setURIProject','');
		app.$store.commit('setTestdata','fakeToolsShort');
		app.$store.dispatch('updateToolsFromRemote');
		app.$router.push('/download');

		setTimeout(()=>{
			expect(JSON.stringify([
				numRowsBeforeLogut,
				holder.selectAll('#sjcda-left-panel-table-body tr').size()
			])).toEqual('[11,1]');
			done();
		},500);
	});

	afterAll(function(done) {
		holder.remove();
		done();
	});
});
