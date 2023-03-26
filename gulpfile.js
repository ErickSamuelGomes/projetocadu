// Version file JS 
var versaoDoJs = "/* Version Orquestra-Bootstrap - 1.0.3*/";

// Version file CSS
var versaoDoCss = "/* Version Orquestra-Bootstrap - 1.0.3 */";

// Folder for copy
var copy = [
    'src/**/*',
    '!src/assets/icon/custom{,/**}',
    '!src/assets/icon/feather{,/**}',
    '!src/assets/icon/flags{,/**}',
    '!src/assets/icon/microsoft{,/**}',    
    '!src/assets/icon/store{,/**}'
];

// Folders for concat
var css = [
    'dist/vendor/bootstrap-5.0.2-dist/css/bootstrap.css',
    'dist/vendor/selectr/selectr.min.css',
    'dist/vendor/flatpickr/flatpickr.min.css',
    'dist/assets/css/variables.css',
    'dist/assets/css/reboot.css',
    'dist/assets/css/buttons.css',
    'dist/assets/css/colors.css',
    'dist/assets/css/fonts.css',
    'dist/assets/css/loader.css',
    'dist/assets/css/table.css',
    'dist/assets/css/cards.css',
    'dist/assets/css/tabs.css',
    'dist/assets/css/chat.css',
    'dist/assets/css/form.css',
    'dist/assets/css/editor.css',
    'dist/assets/css/icons.css',
    'dist/assets/css/animation.css',
    'dist/assets/css/ie.css',
    'dist/assets/css/util.css',
    'dist/assets/css/modal.css',
    'dist/assets/css/ui.css',
    'dist/assets/css/ui-responsive.css',
    'dist/assets/css/focus.css',
    'dist/assets/css/tooltip.css',
    'dist/assets/css/guideline-variables.css',
    'dist/assets/css/button-create-new.css',
    'dist/assets/css/field-rules.css',
    'dist/assets/css/signature.css',
    'dist/assets/css/alerts.css',
    'dist/assets/css/badges.css',
    'dist/assets/css/documentation-site.css',
    'dist/assets/css/typography.css',
    'dist/assets/css/toast.css',
    'dist/assets/css/form-builder.css',
    'dist/assets/css/global.css'
  ];

var csseditor = [
    'dist/vendor/quill-1.3.6/quill.snow.css',
    'dist/assets/css/editor.css'
];


var csslight = [
    'dist/assets/css/variables.css',
    'dist/assets/css/fonts.css',
    'dist/assets/css/reboot.css',
    'dist/assets/css/colors.css',
    'dist/assets/css/buttons.css',
    'dist/assets/css/cards.css',
    'dist/assets/css/loader.css',
    'dist/assets/css/util.css',
    'dist/assets/css/tabs.css'
];

var js = [
    'dist/vendor/bootstrap-5.0.2-dist/js/bootstrap.bundle.js',
    'dist/vendor/bootstrap-native/bootstrap-native.js',
    'dist/vendor/selectr/selectr.min.js',
    'dist/vendor/flatpickr/flatpickr.min.js',
    'dist/vendor/flatpickr/es.js',
    'dist/vendor/flatpickr/pt.js',
    'dist/assets/js/util.js',
    'dist/assets/js/ui.js',
    'dist/assets/js/localization.js',
    'dist/assets/js/autosuggest.js'
];

var jsmask = [
    'dist/vendor/inputmask/inputmask.min.js',
    'dist/assets/js/inputmask.binding.js'
];

var jseditor = [
    'dist/vendor/quill-1.3.6/quill.min.js',
    'dist/assets/js/quill.config.js'
];


// Compressing images
var img = [
    'dist/assets/logos/**/*.png',
    'dist/assets/styleguides/**/*.png',
    'dist/assets/img/styleguide/**/*.jpg'
];

var svgs = [
    'src/assets/icon/**/*.svg'
];

var svgSprites = [
    'src/assets/icon/sprite/*.svg'
];

var configSvg = {
    mode: {
        inline: true,
        symbol: {
            dest: 'sprite',
            sprite: 'sprite',
            example: false
        }
    },
    transform: [{svgo: false}],

    shape: {
        id: {							
            generator: function(name) {
                return path.basename(name).replace('.svg','');
            }
        },
        dimension: {
          maxWidth: 32,
          maxHeight: 32
        }
    },
    svg: {
        xmlDeclaration: false,
        doctypeDeclaration: false,
        namespaceIDs: false,         
        dimensionAttributes: false,                   
    }
};


// Tasks 
var gulp = require ('gulp'),
    clean = require('gulp-clean'),
    concat = require('gulp-concat'),
    htmlReplace = require('gulp-html-replace'),
    cssnano = require ('gulp-cssnano'),
    uglify = require ('gulp-uglify-es').default,
    path = require('path'),
    imagemin = require('gulp-imagemin'),
    watch = require('gulp-watch'),
    rename = require('gulp-rename'),
    jshint = require('gulp-jshint'),
    browserSync = require('browser-sync'),
    jshintStylish = require('jshint-stylish'),
    csslint = require('gulp-csslint'),
    svgo = require('gulp-svgo'),
    svgSprite = require('gulp-svg-sprite'),
    header = require('gulp-header');
    gutil = require( 'gulp-util');  
    vinylFilterSince = require('vinyl-filter-since');
    babel = require('gulp-babel');
    sourcemaps = require('gulp-sourcemaps');    
    

    gulp.task('clean', () => {
        return gulp.src('dist', { allowEmpty: true })
            .pipe(clean());
    });

    gulp.task('copy', gulp.series('clean', function(){
        return gulp.src(copy)
            .pipe(gulp.dest('dist'));
    }));


    // Compressing svg's
    gulp.task('svgo', () => {
        return gulp.src('src/assets/icon/**/*.svg')
            .pipe(svgo())
            .pipe(gulp.dest('dist/assets/icon'));
    });

    // Generetor Sprites SVG's
    gulp.task('clean-sprites', function () {
        return gulp.src(svgSprites, {read: false})
        .pipe(clean());
    });

    gulp.task('sprites', gulp.series('clean-sprites', function(){
        return gulp.src(svgs)
        .pipe(svgSprite(configSvg))
        .pipe(gulp.dest('src/assets/icon'))
    }));

    // Babel
    gulp.task('babel', () => {
        gulp.src('src/js/*.js')
            .pipe(babel({
                presets: ['es2015']
                // plugins: ['transform-runtime']
            }))
            .pipe(gulp.dest('dist/js'))
    });

    //  Compressing Images
    gulp.task('images', done => {
        gulp.src(img)
        .pipe(imagemin())
        .pipe(gulp.dest('dist/assets/logos'));
        done();
    });

    // Concat and minify
    gulp.task('scripts', () => {
        return gulp.src(js)
            .pipe(sourcemaps.init() )
            .pipe(concat('orquestra-bootstrap.min.js'))
            .pipe(uglify())
            .on('error', console.error.bind(console), function (err) { gutil.log(gutil.colors.red('[Error]'), err.toString()); })
            .pipe(header(versaoDoJs))   
            .pipe(sourcemaps.write('./')) 
            .pipe(gulp.dest('dist/assets/js'))
    });

    // Concat and minify
    gulp.task('scripts-mask', () => {
        return gulp.src(jsmask)
            .pipe(sourcemaps.init() )
            .pipe(concat('orquestra-bootstrap-inputmask.min.js'))
            .on('error', console.error.bind(console), function (err) { gutil.log(gutil.colors.red('[Error]'), err.toString()); })
            .pipe(header(versaoDoJs))   
            .pipe(sourcemaps.write('./')) 
            .pipe(gulp.dest('dist/assets/js'))
    });

// Concat and minify
    gulp.task('scripts-editor', () => {
        return gulp.src(jseditor)
            .pipe(sourcemaps.init() )
            .pipe(concat('orquestra-bootstrap-editor.min.js'))
            .on('error', console.error.bind(console), function (err) { gutil.log(gutil.colors.red('[Error]'), err.toString()); })
            .pipe(header(versaoDoJs))   
            .pipe(sourcemaps.write('./')) 
            .pipe(gulp.dest('dist/assets/js'))
    });


    gulp.task('css', () => {
        return gulp.src(css)
            .pipe(concat('orquestra-bootstrap.min.css'))
            .pipe(cssnano({safe: true, autoprefixer: {
                remove: false
              }}))
            .pipe(header(versaoDoCss))            
            .pipe(gulp.dest('dist/assets/css'))
        });

    gulp.task('css-editor', () => {
        return gulp.src(csseditor)
            .pipe(concat('orquestra-bootstrap-editor.min.css'))
            .pipe(cssnano({safe: true}))
            .pipe(header(versaoDoCss))            
            .pipe(gulp.dest('dist/assets/css'))
        });  


    gulp.task('css-light', () => {
        return gulp.src(csslight)
            .pipe(concat('orquestra-bootstrap-light.min.css'))
            .pipe(cssnano({safe: true}))
            .pipe(header(versaoDoCss))            
            .pipe(gulp.dest('dist/assets/css'))
        });        

    // Change directory name in html
    gulp.task('html', done => {
        gulp.src('dist/**/*.html')
            .pipe(htmlReplace({
                css: 'assets/css/orquestra-bootstrap.min.css',
                js: 'assets/js/orquestra-bootstrap.min.js'
            }))
            .pipe(gulp.dest('dist'))
        done();
    });

    gulp.task('minify',  gulp.series(['scripts', 'css', 'scripts-mask', 'scripts-editor', 'css-light', 'css-editor']));

    gulp.task('default', gulp.series('copy', 'sprites', 'minify', 'html', 'images', function(done){
        //gulp.start('sprites', 'minify', 'html', 'images');
        done();

    }));

    gulp.task('server', () => {
        browserSync.init({
            server: {
                baseDir: 'src'
            }
        });

    gulp.watch('src/**/*').on('change', browserSync.reload);

    gulp.watch('src/assets/js/**/*.js').on('change', (event) => {
        console.log("Linting " + event.path);
            gulp.src(event.path)
                .pipe(jshint())
                .pipe(jshint.reporter(jshintStylish));
    });

    gulp.watch('src/assets/css/**/*.css').on('change', (event) => {
        console.log("Linting " + event.path);
            gulp.src(event.path)
                .pipe(csslint())
                .pipe(csslint.reporter());
    });    

});

    gulp.task('watch', () => {
        gulp.watch(js, ['scripts']);
        gulp.watch(css, ['css']);
    });

    