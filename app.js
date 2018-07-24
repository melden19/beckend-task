var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local');
var LocalStrategy = require('passport-strategy');
var mongo = require('mongodb');
var mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/loginapp');
var db = mongoose.connection;

let routes = require('./routes/index')
let users = require('./routes/routes')

const app = express();

//view engine
// const hbs = exphbs.create({
//   helpers: {

//   },
//   defaultLayout: 'layout'
// });

app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({defaultLayout: 'layout'}));
app.set('view engine', 'handlebars');

app.use(express.static(path.join(__dirname, '/public')));
// body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

//static folder
app.use(express.static(path.join(__dirname, 'public')));

//express session
app.use(session({
  secret: 'secret',
  saveUninitialized: true,
  resave: true
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(expressValidator({
  errorFormatter: (param, msg, value) => {
    let namespace = param.split('.')
    , root = namespace.shift()
    , formParam = root;

    while (namespace.length) {
      formParam += `[${namespace.shift()}]`  
    }
    return {
      param: formPage,
      msg: msg,
      value: value
    };
  } 
}))

//flesh express
app.use(flash());

// global vars
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  console.log("LOG: ", res.locals);
  next();
})


app.use('/', routes);
app.use('/', users);

app.set('port', (process.env.PORT || 3000));

app.listen(app.get('port'), () => {
  console.log(`Server statted on port ` + app.get('port'));
})

