const gulp = require("gulp");
const htmlmin = require("gulp-htmlmin");
const cleanCSS = require("gulp-clean-css");
const terser = require("gulp-terser");
const rename = require("gulp-rename");
const browserSync = require("browser-sync").create();
const reload = browserSync.reload;

gulp.task("minify-html", () => {
  return gulp
    .src("src/*.html")
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest("public"));
});

gulp.task("minify-js", () => {
  return gulp
    .src("src/app.js")
    .pipe(terser())
    .pipe(rename({ extname: ".min.js" }))
    .pipe(gulp.dest("public"));
});

gulp.task("minify-css", () => {
  return gulp
    .src("src/styles.css")
    .pipe(cleanCSS())
    .pipe(rename({ extname: ".min.css" }))
    .pipe(gulp.dest("public"));
});

gulp.task("minify", gulp.parallel("minify-html", "minify-js", "minify-css"));

gulp.task("watch", () => {
  browserSync.init({
    server: {
      baseDir: "./public",
    },
  });
  gulp.watch("src/index.html", gulp.series("minify-html")).on("change", reload);
  gulp.watch("src/app.js", gulp.series("minify-js")).on("change", reload);
  gulp.watch("src/styles.css", gulp.series("minify-css")).on("change", reload);
});

gulp.task("default", gulp.series("minify", "watch"));
