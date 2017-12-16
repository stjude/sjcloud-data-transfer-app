/* eslint-disable max-len */

import { select } from 'd3-selection';

const _App = window._App;

describe('FileStatus table for an empty project', () => {
  const holder = select('body').append('div');
  let app;
  beforeAll((done) => {
    holder.append('div').attr('id', 'fsaaa');
    app = _App('#fsaaa', {
      testdata: 'fakeTools',
      showAllFiles: true,
      showAllProjects: true,
    });
    app.$router.push('/download');
    setTimeout(() => {
      app.$store.commit('setCurrToolName', 'x1');
      done();
    }, 600);
  });

  it('should not be displayed', (done) => {
    setTimeout(() => {
      expect(holder.select('#file-status-div').node()).toEqual(null);
      done();
    }, 500);
  });

  afterAll((done) => {
    holder.remove();
    done();
  });
});

describe('FileStatus table for a project with pending downloads', () => {
  const holder = select('body').append('div');
  let app;

  beforeAll((done) => {
    holder.append('div').attr('id', 'fsbbb');
    app = _App('#fsbbb', {
      testdata: 'fakeTools',
      showAllFiles: true,
      showAllProjects: true,
    });
    app.$router.push('/download');
    setTimeout(() => {
      app.$store.commit('setCurrToolName', 'x2');
      done();
    }, 600);
  });

  it('should be displayed', (done) => {
    setTimeout(() => {
      expect(holder.select('#file-status-div').size()).toEqual(1);
      done();
    }, 500);
  });

  it('should have 9 rows of listed files', (done) => {
    setTimeout(() => {
      expect(holder.select('#file-status-table-body').selectAll('tr').size()).toEqual(9);
      done();
    }, 500);
  });

  it('should have 1 empty status cells', (done) => {
    expect(holder.select('#file-status-table-body')
      .selectAll('.file-status-cell-status')
      .filter(function (d) {
        return !this.innerHTML || this.innerHTML === '<!---->';
      })
      .size())
      .toEqual(1);

    done();
  });

  it('should have 1 starting status cell', (done) => {
    expect(holder.select('#file-status-table-body')
      .selectAll('.file-status-cell-status-progress-text')
      .filter(function (d) {
        return select(this).html() === 'Started';
      })
      .size())
      .toEqual(1);

    done();
  });

  it('should have 6 in-progress status cells', (done) => {
    expect(holder.select('#file-status-table-body')
      .selectAll('.file-status-cell-status-progress-bar')
      .size())
      .toEqual(6);

    done();
  });

  it('should have 2 completed status cells', (done) => {
    expect(holder.select('#file-status-table-body')
      .selectAll('.file-status-cell-status .material-icons')
      .filter(function (d) {
        return select(this).html() === 'check_circle';
      })
      .size())
      .toEqual(2);

    done();
  });

  afterAll((done) => {
    // holder.remove();
    done();
  });
});

describe('FileStatus table for a project with completed transfer', () => {
  const holder = select('body').append('div');
  let app;

  beforeAll((done) => {
    holder.append('div').attr('id', 'fsccc');
    app = _App('#fsccc', {
      testdata: 'fakeTools',
      showAllFiles: true,
      showAllProjects: true,
    });
    app.$router.push('/download');
    setTimeout(() => {
      app.$store.commit('setCurrToolName', 'x3');
      done();
    }, 500);
  });

  it('should not be displayed for uploads', (done) => {
    app.$router.push('/upload');
    setTimeout(() => {
      expect(holder.select('#file-status-div').node().parentNode.style.display).toEqual('none');
      done();
    }, 600);
  });

  it('should have no in-progress status cells', (done) => {
    expect(holder.select('#file-status-table-body')
      .selectAll('.file-status-cell-status-progress-bar')
      .size())
      .toEqual(0);

    done();
  });

  it('should have 2 completed status cells', (done) => {
    expect(holder.select('#file-status-table-body')
      .selectAll('.file-status-cell-status .material-icons')
      .filter(function (d) {
        return select(this).html() === 'check_circle';
      })
      .size())
      .toEqual(2);

    done();
  });

  afterAll((done) => {
    holder.remove();
    done();
  });
});

