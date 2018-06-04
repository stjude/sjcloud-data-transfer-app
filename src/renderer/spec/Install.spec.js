import { select } from 'd3-selection';

const _App = window._App;

describe('Install', () => {
  const holder = select('body').append('div');
  holder.append('div').attr('id', 'install-aaa');
  let app;
  beforeAll(done => {
    app = _App(
      '#install-aaa',
      {
        testdata: 'emptyTools',
        showAllFiles: true,
        showAllProjects: true,
      },
      () => {
        app.$router.push('/install');
        setTimeout(() => {
          done();
        }, 500);
      },
    );
  });

  it('should display the initial download screen', done => {
    expect(holder.select('.theater-body-img img').attr('src')).toEqual(
      'img/screen-download.png',
    );
    done();
  });

  afterAll(done => {
    select('#install-aaa').remove();
    done();
  });
});
