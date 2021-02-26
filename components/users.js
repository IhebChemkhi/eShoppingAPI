const express = require('express');
const has = require('has-value');
const router = express.Router();
const bcrypt= require('bcrypt');
const items= require('./items');
const uuidv4 = require('uuid/v4');
const exampleSchema = require('./schemas/exampleSchema.json');
const itemSchema= require('./schemas/ItemSchema.json');
const Ajv = require('ajv').default;
const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy,
      ExtractJwt = require('passport-jwt').ExtractJwt;
const BasicStrategy = require('passport-http').BasicStrategy;
const users = require('./users');

function validateJSONHeaders(req, res, next)
{
    if(req.get('Content-Type') === 'application/json')
    {
        next();
    }
    else
    {
        const err = new Error('Bad Request - Missing Headers');
        err.status = 400;
        next(err);
    }
}


let userData = {
    users: [{
        userID: "f3bc26a8-a091-4366-95b4-3ab3747c5c23",
        FirstName: "Iheb",
        LastName: "CHEMKHI",
        DateOfBirth: "1999-10-12",
        Email: "ihebchemkhi@gmail.com",
        Gender: "Male",
        City: "Oulu",
        CountryCode: "FI",
        Username: "putra",
        Password: "$2b$06$pEh3z4nKFuEx.l/sTcOHmugQm1.CLBe3fKT7ZSoCQA0UfwX26CpIa", // putra123
        date: "1989-09-26T06:34:25.096Z"
    },
    {
        userID: "d1b02c08-ebf9-445d-a1c2-ce2118372ec0",
        FirstName: "Hatim",
        LastName: "MRABET",
        DateOfBirth: "2001-06-10",
        Email: "testuser1235@gmail.com",
        Gender: "Male",
        City: "Oulu",
        CountryCode: "FI",
        Username: "Kinggtn",
        Password: "$2b$06$KpMOZzFqhmDMEY2QzE8HsO3yHT9P4HiBf3urJLt555ypEzd9.6bBS",// king132
        date: "1989-09-26T06:34:25.096Z"
    }]
}

//  Return all user information
router.get('/', (req, res) => {res.json(userData)});

//  Return information of a single user
router.get('/:Username', (req, res) => {
    const resultUser = userData.users.find(d => d.Username == req.params.Username);
    if(resultUser === undefined)
    {
        res.sendStatus(404)
    }
    else
    {
        res.json(resultUser);
    }
})

/* Middleware to validate new user creation */
function validateNewUser(req, res, next)
{
    // prepare error object
  const ajv = new Ajv();
  const validate = ajv.compile(exampleSchema);

  //console.log(req.body);
  const isValid = validate(req.body);
  //console.log('isValid', isValid);
  //console.log(validate.errors);

  if(isValid == false) {
    res.status(400);
    res.send(validate.errors.map(e => e.message));
    res.send(' not OK');
  }
  const usernameVerif= userData.users.find(u => u.Username == req.body.Username);
  //console.log(req.body.Username);
  //console.log(usernameVerif);
  const emailVerif= userData.users.find(t=> t.Email == req.body.Email);
  //console.log(emailVerif);
  
  if (usernameVerif != undefined){
    res.status(400);
    res.send('Username already taken');
  }
  else if (emailVerif != undefined)
  {
    res.status(400);
    res.send('email already used');
  }
  else{
    next();
  }
  

}


/* Middleware to validate new item creation */
function validateNewItem(req, res, next)
{
    // prepare error object
  const ajv = new Ajv();
  const validate = ajv.compile(itemSchema);

  //console.log(req.body);
  const isValid = validate(req.body);
  //console.log('isValid', isValid);
  //console.log(validate.errors);

  if(isValid == false) {
    res.status(400);
    res.send(validate.errors.map(e => e.message));
    res.send(' not OK');
  }
  next();

}





router.post('/',
    [
      validateJSONHeaders,
      validateNewUser
    ],

    (req, res) => {
        const hashedPassword = bcrypt.hashSync(req.body.Password,6);
        const newUser = {
            /*id: userData.users.length + 1,
            name: req.body.name,
            image: req.body.image*/
            userID: uuidv4(),
            Username: req.body.Username,
            Firstname: req.body.FirstName,
            Lastname: req.body.LastName,
            Dateofbirth: req.body.DateOfBirth,
            Gender: req.body.Gender,
            Email: req.body.Email,
            City: req.body.City,
            Countrycode: req.body.CountryCode,
            Password: hashedPassword,
            date: new Date().toISOString()
        }
        userData.users.push(newUser);
        res.status(201);
        res.json(
        {
            userID: newUser.userID,
            date: newUser.date
        }
        );
});
/*
router.delete('/:Username', (req, res) => {
    userData.users = userData.users.filter(user => user.Username != req.params.Username);
    res.sendStatus(200);
})
*/

router.get('/:userID/items', (req, res) => { const getItem = items.getItemsByID(req.params.userID); res.json(getItem)});
router.post('/items',
passport.authenticate('jwt', { session: false }),
[
    validateJSONHeaders,
    validateNewItem
],

(req, res) => {

    const newItem = {
        id: uuidv4(),
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
        location: req.body.location,
        images: req.body.images,
        price: req.body.price,
        date: new Date().toISOString(),
        type: req.body.type,
        shipping: req.body.shipping,
        seller: {
            id: req.user.userID,
            username: req.user.username,
            email:req.user.email
        } 
        //sellername: this.getUserByID(req.params.userID).FirstName,
        //sellerUsername: this.getUserByID(req.params.userID).Username
        
    }
    items.addItemData(newItem);
   // console.log(newItem);
    res.status(201);
    res.json(
    {
        Status:"Created!",
        title: newItem.title,
        seller: {
            username: newItem.seller.username,
            email:newItem.seller.email,
            id: newItem.seller.id,

        },

        id: newItem.id
    }
    );
})



router.put('/items/:itemid',
passport.authenticate('jwt', { session: false }),
[
    validateJSONHeaders,
    validateNewItem
],
(req, res) => {
    if (items.getItemsByItemID(req.params.itemid) == undefined ){
        //console.log("item doesnt exist");
        res.status(400);
        res.json({status : "item doesnt exist"})
    }
    else {
        //console.log("item found");
        if (items.getItemsByItemID(req.params.itemid).seller.id != req.user.userID ){
            //console.log("you cannot modify this item");
            res.status(401);
            res.json({status: "you cant modify this item"})
        }
        else{
        //console.log("EVERYTHING IS OK");

        let i= items.getItemsByItemID(req.params.itemid);
        i.title= req.body.title;
        i.description= req.body.description;
        i.category= req.body.category;
        i.location= req.body.location;
        i.images= req.body.images;
        i.price= req.body.price;
        i.date= new Date().toISOString();
        i.type=req.body.type;
        i.shipping=req.body.shipping;
        res.status(200);
        res.json({status:"OK"})
        }
    }
})


router.delete('/items/:itemID',
passport.authenticate('jwt', { session: false }),
(req, res) => {
    if (items.getItemsByItemID(req.params.itemID) == undefined ){
        console.log("item doesnt exist");
        res.status(400);
        res.json({status : "item doesnt exist"})
    }
    else {
        console.log("item found");
        if (items.getItemsByItemID(req.params.itemID).seller.id != req.user.userID ){
            console.log("you cannot DELETE this item");
            res.status(400);
            res.json({status: "you cant DELETE this item"})
        }
        else{
        //let i= items.getItemsByItemID(req.params.itemID);
       /* items.deleteItem(req.params.itemID);
        console.log(items.getAllItems());
        console.log("Verification ended successfully, item deleted");
        res.json({status: "Deleted"})*/
        let tab= items.getAllItems();
        for (var i= 0; i<tab.length; i++){
            if(tab[i].id == req.params.itemID){
                tab.splice(i,1);
            }
        }
        console.log(tab);
        console.log("Verification ended successfully, item deleted");
        res.status(200);
        res.json({status: "Deleted"})

    }
    }
}
)

module.exports = { router,
    getUserByName: (username) => userData.users.find(u => u.Username == username),
    getUserByID: (userID) => userData.users.find(u => u.userID == userID)
}