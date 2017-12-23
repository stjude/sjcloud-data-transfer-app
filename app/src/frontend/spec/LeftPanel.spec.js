import {
  select,
} from 'd3-selection';

const _App = window._App;

describe('LeftPanel for a user with no projects', () => {
  const holder = select('body').append('div');
  holder.append('div').attr('id', 'leftbbb');
  let app;
  beforeAll((done) => {
    app = _App('#leftbbb', {
      testdata: 'emptyTools',
      showAllFiles: true,
      showAllProjects: true,
    }, ()=>{
      app.$router.push('/download');
      setTimeout(() => {
        done();
      }, 500);
    });
  });
  /*
  !!!
  Seems to be fixed now, previously:
  - Figure out why this spec file passes by itself,
  - but fails when tested with other spec files
  !!!
  */
  it('should display the no projects found div.', (done) => {
    setTimeout(() => {
      expect(holder.selectAll('.no-projects-div').size()).toEqual(1);
      done();
    }, 1000);
  });

  afterAll((done) => {
    holder.remove();
    done();
  });
});


describe('LeftPanel for a user with projects', () => {
  const holder = select('body').append('div');
  holder.append('div').attr('id', 'leftaaa');
  let app;
  beforeAll((done) => {
    app = _App('#leftaaa', {
      testdata: 'fakeTools',
      showAllFiles: true,
      showAllProjects: true,
    }, ()=>{
      app.$router.push('/download');
      // note: simulated data load is delayed by 500 ms
      setTimeout(() => {
        app.$store.commit('setCurrToolName', 'x2');
        done();
      }, 500);
    });
  });

  it('should have the correct # of rows for tools', (done) => {
    setTimeout(() => {
      expect(holder.select('#file-status-div').selectAll('tr').size()).toEqual(10);
      done();
    }, 300);
  });

  it('should have the correct # of rows for sj tools', (done) => {
    setTimeout(() => {
      expect(holder.selectAll('tr .badge')
        .filter(function (b) {
          return this.style.display !== 'none';
        })
        .size()).toEqual(1);
      done();
    }, 500);
  });

  afterAll((done) => {
    holder.remove();
    done();
  });
});
