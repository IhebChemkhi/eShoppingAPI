const express = require('express');
const router = express.Router();
const app = express();
const bcrypt= require('bcrypt');
const users = require('./users');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy,
      ExtractJwt = require('passport-jwt').ExtractJwt;
const BasicStrategy = require('passport-http').BasicStrategy;

let jwtSecretKey = null;
if(process.env.JWTKEY === undefined) {
  jwtSecretKey = require('./jwt-key.json').secret;
} else {
  jwtSecretKey = process.env.JWTKEY;
}


let options = {}

/* Configure the passport-jwt module to expect JWT
   in headers from Authorization field as Bearer token */
options.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();

/* This is the secret signing key.
   You should NEVER store it in code  */
options.secretOrKey = jwtSecretKey;

passport.use(new JwtStrategy(options, function(jwt_payload, done) {
  //console.log("Processing JWT payload for token content:");
  //console.log(jwt_payload);


  /* Here you could do some processing based on the JWT payload.
  For example check if the key is still valid based on expires property.
  */
  const now = Date.now() / 1000;
  if(jwt_payload.exp > now) {
    done(null, jwt_payload.user);
  }
  else {// expired
    done(null, false);
  }
}));


passport.use(new BasicStrategy(
  function(username, password, done) {

    const user = users.getUserByName(username);
    if(user == undefined) {
      // Username not found
      //console.log("Wrong username");
      return done(null, false, { message: "HTTP Basic username not found" });
    }

    /* Verify password match */
    //console.log(bcrypt.compareSync(password, user.Password));

    if(bcrypt.compareSync(password, user.Password) == false) {
      // Password does not match
      //console.log("password NOT matching username");
      return done(null, false, { message: "HTTP Basic password not found" });
    }
    return done(null, user);
  }
));

router.get(
  '/jwt',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    //console.log("jwt");
    res.json(
      {
        status: "Successfully accessed protected resource with JWT",
        user: req.user
      }
    );
  }
);

router.get('/',
        passport.authenticate('basic', { session: false }),
        (req, res) => {
          const body = {
            username: req.user.Username,
            email : req.user.Email,
            userID: req.user.userID
          };
      
          const payload = {
            user : body
          };
      
          const options = {
            expiresIn: '1d'
          }
      
          /* Sign the token with payload, key and options.
             Detailed documentation of the signing here:
             https://github.com/auth0/node-jsonwebtoken#readme */
          const token = jwt.sign(payload, jwtSecretKey, options);
      
          return res.json({ token,
            Statut: "CONNECTED" });
  /*== res.json({
    Statut: "CONNECTED"
  });*/ 
});



module.exports = router;