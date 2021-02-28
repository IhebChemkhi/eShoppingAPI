const express = require('express');
const has = require('has-value');
const router = express.Router();
const uuidv4 = require('uuid/v4');
const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy,
      ExtractJwt = require('passport-jwt').ExtractJwt;
const BasicStrategy = require('passport-http').BasicStrategy;


let itemData = {
    items: [{
        title: "selling car",
        description: "Mercedes AMG GTS looks great in this sporty combo complimented by a great spec including premium pack.. ",
        category: "cars",
        location: "Oulu",
        images: "carBMW.png",
        price: 20000,
        date: "18-04-2021",
        type:"BMW amg",
        shipping:"pickup",
        seller: {
            id:"f3bc26a8-a091-4366-95b4-3ab3747c5c23",
            username:"putra",
            email:"ihebchemkhi@gmail.com"
        },
        id: "2fe5c7af-c80f-4581-ba82-0badcde3973d"
    },
    {
        title: "Selling phone",
        description: "Iphone 11 Black 128GB  Dual 12MP Ultra Wide and Wide cameras",
        category: "phones",
        location: "Oulu",
        images: "xxTexx456.png",
        price: 1600,
        date: "18-03-2021",
        type:"red 25cm",
        shipping:"pickup",
        seller: {
            id:"f3bc26a8-a091-4366-95b4-3ab3747c5c23",
            username:"putra",
            email:"ihebchemkhi@gmail.com"
        },
        id:"4027ccf0-38d2-4626-a74b-3fb341b6cfe9"
    },
    {
        title: "selling socks",
        description: "red skull socks",
        category: "cloths",
        location: "Oulu",
        images: "socks2031.png",
        price: 1,
        date: "18-04-2021",
        type:"red pointy 41",
        shipping:"pickup",
        seller: {
            id:"d1b02c08-ebf9-445d-a1c2-ce2118372ec0",
            username:"Kinggtn",
            email:"testuser1235@gmail.com"
        },
        id: "21944c58-1280-4a17-8614-a4059901de57"
    }
    ]
};

//router.get('/', (req, res) => { const getItem = items.getAllItems(); res.json(getItem)});
router.get('/',(req,res) =>{res.json(itemData)});

router.get('/user/',
passport.authenticate('jwt', { session: false }),
(req,res) =>{
    let result = itemData.items.filter(i => i.seller.id == req.user.userID);
    res.json(result)});



router.get('/searchByCategory/:category', (req,res) => {
   const  filteredItems = itemData.items.filter(i => i.category == req.params.category);
    res.status(200);
    res.json(filteredItems);
})
router.get('/searchByLocation/:location', (req,res) => {
    const filteredItems1= itemData.items.filter(j => j.location == req.params.location);
    res.status(200);
    res.json(filteredItems1);
})
router.get('/searchByDate/:date', (req,res) => {
    const filteredItems2 = itemData.items.filter(k => k.date.slice(0,10) == req.params.date);
    res.status(200);
    res.json(filteredItems2);
})
module.exports = {
    router,
    getAllItems: () => itemData.items,
    getItemsByID: (userID) => itemData.items.filter(u => u.seller.id == userID),
    getItemsByItemID:(itemID) => itemData.items.find(u => u.id == itemID),
    addItemData : (item) => itemData.items.push(item),
    deleteItem: (itemID) => itemData.items.filter(i => i.id != itemID)
}