import {
  select,
} from "d3-selection";

const _App = window._App;

describe("Install", function() {
  const holder = select("body").append("div");
  holder.append("div").attr("id", "install-aaa");
  let app;
  beforeAll(function(done) {
    app = _App("#install-aaa", {
      testdata: "emptyTools",
      showAllFiles: true,
      showAllProjects: true,
    });
    app.$router.push("/install");
    done();
  });

  it("should display the initial download screen", function(done) {
    setTimeout(() => {
      expect(holder.select(".theater-body-img img").attr("src")).toEqual("img/screen-download.png");
      done();
    }, 50);
  });

  afterAll(function(done) {
    select("#install-aaa").remove();
    done();
  });
});
