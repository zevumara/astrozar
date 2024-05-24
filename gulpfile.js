const gulp = require("gulp");
const htmlmin = require("gulp-htmlmin");
const cleanCSS = require("gulp-clean-css");
const terser = require("gulp-terser");
const rename = require("gulp-rename");
const livereload = require("gulp-livereload");

gulp.task("minify-html", () => {
  return gulp
    .src("src/*.html")
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest("public"))
    .pipe(livereload());
});

gulp.task("minify-js", () => {
  return gulp
    .src("src/app.js")
    .pipe(terser())
    .pipe(rename({ extname: ".min.js" }))
    .pipe(gulp.dest("public/js/"))
    .pipe(livereload());
});

gulp.task("minify-css", () => {
  return gulp
    .src("src/*.css")
    .pipe(cleanCSS())
    .pipe(rename({ extname: ".min.css" }))
    .pipe(gulp.dest("public/css/"))
    .pipe(livereload());
});

gulp.task("minify", gulp.parallel("minify-html", "minify-js", "minify-css"));

gulp.task("watch", () => {
  livereload.listen({
    port: 35729,
  });
  gulp.watch("src/index.html", gulp.series("minify-html"));
  gulp.watch("src/app.js", gulp.series("minify-js"));
  gulp.watch("src/animations.css", gulp.series("minify-css"));
  gulp.watch("src/styles.css", gulp.series("minify-css"));
});

gulp.task("default", gulp.series("minify", "watch"));
