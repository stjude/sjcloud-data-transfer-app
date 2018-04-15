import {select, selectAll} from 'd3-selection';

const _App = window._App;

describe('Upload panel for an empty project', () => {
  const holder = select('body').append('div');
  holder.append('div').attr('id', 'uploadaaa');
  let app;
  beforeAll(done => {
    app = _App(
      '#uploadaaa',
      {
        testdata: 'fakeTools',
        showAllFiles: true,
        showAllProjects: true,
      },
      () => {
        app.$router.push('/upload');
        app.$store.commit('setCurrToolName', 'x1');
        setTimeout(() => {
          done();
        }, 500);
      }
    );
  });

  it('should not display a loading spinner', done => {
    expect(holder.selectAll('.spinner-pct-container').size()).toEqual(0);
    done();
  });

  it('should show a drop-zone for uploads', done => {
    app.$router.push('/upload');
    setTimeout(() => {
      expect(holder.selectAll('.dropzone').size()).toEqual(1);
      done();
    }, 600);
  });

  afterAll(done => {
    holder.remove();
    done();
  });
});

describe('Upload panel for a project with completed transfer', () => {
  const holder = select('body').append('div');
  holder.append('div').attr('id', 'uploadccc');
  let app;

  beforeAll(done => {
    app = _App(
      '#uploadccc',
      {
        testdata: 'fakeTools',
        showAllFiles: true,
        showAllProjects: true,
      },
      () => {
        app.$router.push('/upload');
        app.$store.commit('setCurrToolName', 'x3');
        setTimeout(() => {
          done();
        }, 600);
      }
    );
  });

  it('should display a completion message', done => {
    expect(
      holder
        .selectAll('.sjcda-step-outcome-root-div')
        .selectAll('.material-icons')
        .filter(function(d) {
          return (
            select(this)
              .html()
              .trim() === 'done'
          );
        })
        .size()
    ).toEqual(1);

    done();
  });

  it('should display two buttons', done => {
    setTimeout(() => {
      expect(
        holder
          .selectAll('button')
          .selectAll('.material-icons')
          .filter(function(d) {
            const html = select(this)
              .html()
              .trim();
            return html === 'cloud_upload' || html === 'open_in_browser';
          })
          .size()
      ).toEqual(2);
    });

    done();
  });

  afterAll(() => {
    holder.remove();
  });
});
