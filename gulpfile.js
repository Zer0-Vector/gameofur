const gulp = require('gulp');
const del = require('del');
const decomment = require('gulp-decomment');
const map =  require('map-stream');

const SRC_DIR = './src';
const SRC_NODE = SRC_DIR+'/*.js';
const SRC_JS = SRC_DIR + '/scripts/**/*.js';
const SRC_CSS = SRC_DIR + '/css/*.css';
const SRC_SVG = SRC_DIR + '/images/**/*.svg';
const SRC_PNG = SRC_DIR + '/images/**/*.png';
const SRC_HTML = SRC_DIR + '/html/**/*.html';
const OUTPUT_DIR = './dist';
const WWW_ROOT = OUTPUT_DIR + '/site';
const WWW_JS = WWW_ROOT + '/scripts';
const WWW_CSS = WWW_ROOT + '/css';
const WWW_IMAGES = WWW_ROOT + '/images';

function copyFiles(srcPattern, destDir) {
    console.log("Deploying "+srcPattern+" into "+destDir);
    return gulp.src(srcPattern)
        .pipe(gulp.dest(destDir));
}

function node() {
    return copyFiles(SRC_NODE, OUTPUT_DIR);
}

function html() {
    return copyFiles(SRC_HTML, WWW_ROOT);
}

function js() {
    return copyFiles(SRC_JS, WWW_JS);
}

async function jsdeps() {
    console.log("Copying js dependencies...");
    copyFiles('./node_modules/jquery/dist/jquery.js', WWW_JS);
    copyFiles('./node_modules/jquery-ui-dist/jquery-ui.js', WWW_JS);
}

function css() {
    return copyFiles(SRC_CSS, WWW_CSS);
}

function images() {
    copyFiles(SRC_PNG, WWW_IMAGES);
    return gulp.src(SRC_SVG)
            .pipe(map(function (file, cb) {
                let contents = file.contents.toString('utf8');
                let beforeLen = contents.length;
                contents = contents.replace(/\s*\<style\>.*(?:\s.*)*?\s*\<\/style\>/ig, "");
                if (beforeLen !== contents.length) {
                    console.log("<style> stripped from ",file.basename)
                }
                file.contents = Buffer.from(contents, 'utf8');
                cb(null, file);
            }))
            .pipe(decomment({trim:true}))
            .pipe(gulp.dest(WWW_IMAGES));
}

async function clean() {
    console.log("Cleaning "+OUTPUT_DIR);
    return del.sync(OUTPUT_DIR);
}

function watch() {
    gulp.watch(SRC_HTML, html);
    gulp.watch(SRC_JS, js);
    gulp.watch(SRC_CSS, css);
    gulp.watch(SRC_CSS, images);
    gulp.watch(SRC_PNG, images);
}

exports.clean = clean;
exports.watch = watch;
exports.build = gulp.series(html, jsdeps, js, css, images, node);
exports.html = html;
exports.js = gulp.series(jsdeps, js);
exports.css = css;
exports.images = images;
exports.node = node;