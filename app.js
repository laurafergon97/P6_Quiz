

//Aquí encontramos todos los elementos que va a generar el sistema
//Se instalan todos los middlewares con los que va a funcionar


var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var SequelizeStore = require('connect-session-sequelize')(session.Store);
var partials = require('express-partials'); //es un MW para "sacar factor común", introduce layout.ejs 
                                            //en layout habría que introducir las vistas comunes a todas las páginas
                                            //viewport es para ajustar el tamaño de la pagina a los distintos dispositivos
var flash = require('express-flash');
var methodOverride = require('method-override');

var index = require('./routes/index'); //importa los enroutadores (ficheros en routes)

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views')); //indica que las vistas se encuentran en el directorio views
app.set('view engine', 'ejs'); //indican que trabajamos con las vistas de modelo ejs


// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico'))); //public es el directorio y favicon.ico el fichero
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Configuracion de la session para almacenarla en BBDD usando Sequelize.
var sequelize = require("./models");
var sessionStore = new SequelizeStore({
    db: sequelize,
    table: "session",
    checkExpirationInterval: 15 * 60 * 1000, // The interval at which to cleanup expired sessions in milliseconds. (15 minutes)
    expiration: 4 * 60 * 60 * 1000  // The maximum age (in milliseconds) of a valid session. (4 hours)
});
app.use(session({
    secret: "Quiz 2018",
    store: sessionStore,
    resave: false,
    saveUninitialized: true
}));

app.use(methodOverride('_method', {methods: ["POST", "GET"]}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(partials());
app.use(flash());

// Dynamic Helper:
app.use(function(req, res, next) {

    // To use req.session in the views
    res.locals.session = req.session;

    next();
});

app.use('/', index);
//MIDDLEWARES(los anteriores tambíen lo son, los que ponen app.use)
app.use('/', index); //cuando accedemos a la url :localhost:puerto/ accedemos a index y se ejecuta lo que esté en este en función de lo que haya pasado

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;