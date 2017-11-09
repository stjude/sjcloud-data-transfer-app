import {
  select,
} from "d3-selection";
import "./www-init.js";
import "../app/bin/backend/all.js";
import "../app/bin/frontend/app.bundle.css";
import _App from "../app/src/frontend/vue/main.js";

describe("LeftPanel for a user with no projects", function () {
  const holder = select("body").append("div");
  holder.append("div").attr("id", "leftbbb");
  let app;
  beforeAll(function (done) {
    app = _App("#leftbbb", {
      testdata: "emptyTools",
      showAllFiles: true,
      showAllProjects: true,
    });
    app.$router.push("/download");
    // note: simulated data load is delayed by 500 ms
    setTimeout(() => {
      // app.$store.commit('setCurrToolName','x2');
      done();
    }, 500);
  });

  it("should display the no projects found div.", function (done) {
    setTimeout(() => {
      expect(holder.selectAll(".no-projects-div").size()).toEqual(1);
      done();
    }, 300);
  });

  afterAll(function (done) {
    holder.remove();
    done();
  });
});


describe("LeftPanel for a user with projects", function () {
  const holder = select("body").append("div");
  holder.append("div").attr("id", "leftaaa");
  let app;
  beforeAll(function (done) {
    app = _App("#leftaaa", {
      testdata: "fakeTools",
      showAllFiles: true,
      showAllProjects: true,
    });
    app.$router.push("/download");
    // note: simulated data load is delayed by 500 ms
    setTimeout(() => {
      app.$store.commit("setCurrToolName", "x2");
      done();
    }, 500);
  });

  it("should have the correct # of rows for tools", function (done) {
    setTimeout(() => {
      expect(holder.select("#file-status-div").selectAll("tr").size()).toEqual(10);
      done();
    }, 300);
  });

  it("should have the correct # of rows for sj tools", function (done) {
    setTimeout(() => {
      expect(holder.selectAll("tr .badge")
        .filter(function (b) {
          return this.style.display != "none";
        })
        .size()
      ).toEqual(1);
      done();
    }, 500);
  });

  afterAll(function (done) {
    holder.remove();
    done();
  });
});