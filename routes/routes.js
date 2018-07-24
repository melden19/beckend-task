const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check');
const User = require('../models/user');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const multer = require('multer');
const thumb = require('node-thumbnail').thumb;
// const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');
const axios = require('axios');
const weather = require('weather-js');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads')
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '.jpg')
  }
});
const upload = multer({ storage: storage });

router.get('/signup', (req, res) => {
  res.render('register');
})


router.get('/signin', (req, res) => {
  res.render('login');
})
//register user
router.post('/signup', upload.single('img'),
 [
  check('username' , 'username is required').exists(),
  check('username', 'username is too short').isLength({ min: 6 }),
  check('password').isLength({ min: 5 }),
],
 (req, res) => {
  const file = req.file.filename,
        name = req.body.name,
        email = req.body.email,
        username = req.body.username,
        password = req.body.password,
        errors = validationResult(req);
  console.log(errors)

  arrFile = file.split('.');
  newFile = arrFile[0] + '_thumb' + '.jpg'
  if (!errors.isEmpty()) {
    // return res.status(422).json({ errors: errors.array() });
    res.render('register', {
      errors: errors
    });
  } else {
    const newUser = new User({
      img: newFile,
      name: name,
      username: username,
      email: email,
      password: password
    })
    User.createUser(newUser, (err, user) => {
      if (err) throw err;
      console.log(user)
    })

    thumb({
      source: 'public/uploads', // could be a filename: dest/path/image.jpg
      destination: 'public/thumbs',
      width: 100,
      skip: true,
      overwrite: true
    }, function(files, err, stdout, stderr) {
      console.log('All done!', files);
    });

    req.flash('success_msg', 'You are registered and now can login!')

    res.redirect('/signin');
  }
})

passport.use(new LocalStrategy(
  function(username, password, done) {
    User.getUserByUsername(username, (err, user) => { 
      if (err) throw err;
      if (!user )
        return done(null, false, {message: 'Unknown user'});
        User.comparePassword(password, user.password, (err, isMatch) => {
          console.log(password, user.password)
          if (err) throw err;
          if (isMatch) {
            return done(null, user)
          } else {
            return done(null, false, { message: 'Wrong password' })
          }
        })    
    })
  })
);

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

router.post('/signin', 
  passport.authenticate('local', { successRedirect: '/', failureRedirect: '/signin', failureFlash: true }),
  (req, res) => {
    res.redirect('/');
  }
)

router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/signin')
})

router.get('/signin', (req, res) => {
  res.json({
    res: req.user
  })
})

router.get('/images/:name', (req, res) => {
  res.sendFile(`${process.cwd()}/public/thumbs/${req.params.name}`);
})

router.post('/sendData', 
  [
    check('username' , 'username is required').exists()
  ],
  (req, res) => {
  errors = validationResult(req);
  console.log(errors);
  if (!errors.isEmpty()) {
    res.send('exist')
  }
  const id = `9c1b8f37b1656b7656de`;
  const secret = `2d0862a5a870929ced7b7be459bbc1da5fa0db7f`;
  const usernames = req.body.username.split(' ');
  const message = req.body.message;
  console.log(usernames);
  for (let username of usernames) {
    let currentWeather = '';
    const url = `https://api.github.com/users/${username}?client_id=${id}&client_secret=${secret}`
    axios.get(url).then(json => {
      const { location, email} = json.data;
      weather.find({search: location}, (err, result) => {
        if (err) {
          return err;
        } else {
          currentWeather = result[0].current;
          sgMail.setApiKey('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');
          const msg = {
            to: email,
            from: 'denismel19@gmail.com',
            subject: 'Sending with SendGrid is Fun',
            text: 'and easy to do anywhere, even with Node.js',
            html: `<strong>${message}</strong><hr/>
            Temperature: ${currentWeather.temperature}°C <br />
            Рumidity: ${currentWeather.humidity}% <br />
            Windspeed: ${currentWeather.wibdspeed}mph <br />
            Сloudiness: ${currentWeather.skytext} <br />
            `,
          }
          // res.json({ email: email, currentWeather});
          sgMail.send(msg)
        }
      })
    })
  }
  
})
module.exports = router;