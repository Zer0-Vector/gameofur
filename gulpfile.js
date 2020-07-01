const gulp = require('gulp');
const del = require('del');
const decomment = require('gulp-decomment');
const map = require('map-stream');
const gtsc = require('gulp-typescript');

const SRC_DIR = './src';
const SRC_NODE = SRC_DIR+'/*.js';
const SRC_JS = SRC_DIR + '/scripts/**/*.js';
const SRC_CSS = SRC_DIR + '/css/*.css';
const SRC_SVG = SRC_DIR + '/images/*.svg';
const SRC_PNG = SRC_DIR + '/images/*.png';
const SRC_BG_SVG = SRC_DIR + '/images/bg/*.svg'
const SRC_HTML = SRC_DIR + '/html/**/*.html';
const OUTPUT_DIR = './dist';
const WWW_ROOT = OUTPUT_DIR + '/site';
const WWW_JS = WWW_ROOT + '/scripts';
const WWW_CSS = WWW_ROOT + '/css';
const WWW_IMAGES = WWW_ROOT + '/images';
const WWW_IMAGES_BG = WWW_IMAGES + '/bg';

function copyFiles(srcPattern, destDir) {
    console.log("Deploying "+srcPattern+" into "+destDir);
    return gulp.src(srcPattern)
        .pipe(gulp.dest(destDir));
}

var tsProject = gtsc.createProject('tsconfig.json');
async function info() {
    console.log("Sources");
    console.log("-----------------------")
    console.log("node: ",SRC_NODE);
    console.log("ts:   ",tsProject.config.include)
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


function ts() {
    var tsResult = tsProject.src().pipe(tsProject());
    return tsResult.js.pipe(gulp.dest(WWW_JS));
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
    copyFiles(SRC_BG_SVG, WWW_IMAGES_BG);
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
    gulp.watch(SRC_CSS, css);
    gulp.watch(SRC_SVG, images);
    gulp.watch(SRC_PNG, images);
    gulp.watch(SRC_BG_SVG, images);
    gulp.watch(tsProject.config.include, ts);
}

exports.clean = clean;
exports.watch = watch;
exports.build = gulp.series(html, jsdeps, ts, css, images, node);
exports.html = html;
exports.css = css;
exports.images = images;
exports.node = node;
exports.ts = gulp.series(jsdeps, ts);
exports.info = info;