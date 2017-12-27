import {
  select,
} from 'd3-selection';

const _App = window._App;

describe("User Menu's logout button", () => {
  const holder = select('body').append('div');
  holder.append('div').attr('id', 'usermenuaaa');
  let app;

  beforeAll((done) => {
    app = _App('#usermenuaaa', {
      testdata: 'fakeTools',
      showAllFiles: true,
      showAllProjects: true,
    }, ()=>{
      app.$router.push('/download');
      app.$store.commit('setCurrToolName', 'x2');
      setTimeout(() => {
        done();
      }, 500);
    });
  });

  it('should trigger the emptying and replacement of the state.tools array when clicked', (done) => {
    const numRowsBeforeLogut = holder.selectAll('#sjcda-left-panel-table-body tr').size();
    holder.select('#logout-btn').node().click();
    app.$store.commit('setURIProject', '');
    app.$store.commit('setTestdata', 'fakeToolsShort');
    app.$store.dispatch('updateToolsFromRemote');
    app.$router.push('/download');

    setTimeout(() => {
      expect(JSON.stringify([
        numRowsBeforeLogut,
        holder.selectAll('#sjcda-left-panel-table-body tr').size(),
      ])).toEqual('[11,1]');
      done();
    }, 500);
  });

  afterAll((done) => {
    holder.remove();
    done();
  });
});
