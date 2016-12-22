/**
 * Created by vikash on 19-Dec-16.
 */
var express = require('express');
var mongoose = require('mongoose');
var PORT = process.env.PORT || 3000;
var morgan = require('morgan');
var jwt = require('jwt-simple');
var JWT_SECRET = "24446666688888889";
var bodyParser = require('body-parser');
var bcrypt = require('bcrypt-nodejs');
var User = require('./models/users');
var Contact = require('./models/contacts');


var app = express();
//mongoose.connect("mongodb://localhost:27017/contactmanager");
mongoose.connect("mongodb://vikashhrs:12345@ds015902.mlab.com:15902/contactmanager");
//mongodb://vikashhrs:12345@ds015902.mlab.com:15902/contactmanager

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use('/static', express.static(__dirname + '/public'));


app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

app.put('/users/signin', function (req, res) {
    if (!req.body) {
        console.log("parameters received");
    }
    console.log(req.body);
    console.log(req.body.email);
    User.findOne({email: req.body.email}, function (err, user) {
        console.log(err);
        console.log(user);
        if (err)
            throw err;
        if (user) {
            if (bcrypt.compareSync(req.body.password, user.password)) {
                var token = jwt.encode(user, JWT_SECRET);
                res.status(200).send({token: token, name: user.name});
            } else {
                res.status(400).send("Incorrect password");
            }
        }
        if (!user) {
            res.status(400).send("No user found");
        }
    });
    //res.status(200);
    //res.send("ok");
});


app.post('/users', function (req, res) {
    console.log(req.body.user);
    req.body.user.password = bcrypt.hashSync(req.body.user.password, bcrypt.genSaltSync(9));
    //console.log(req.body);
    var user = new User(req.body.user);
    /*var newUser = req.body.user
     newUser.password = bcrypt.hashSync(req.body.user.password,bcrypt.genSaltSync(9));
     var user = new User(newUser);*/
    user.save(function (err) {
        if (err) {
            throw err;
        }

    })
    res.status(200);
    res.send('Saved');
});

app.post('/check/users', function (req, res) {
    console.log(req.body);
    User.findOne({email : req.body.email},function (err,user) {
        if(err)
            throw err;
        if(user){
            res.send({status : "present"});
        }
        if(!user){
            //res.send({status : "notpresent"});
            Contact.findOne({email : req.body.email},function (err,user) {
                if(err)
                    throw err;
                if(user){
                    res.send({status : "present"});
                }
                if(!user){
                    res.send({status : "notpresent"});
                }
            })
        }
    })
});

app.post('/contacts/add', function (req, res) {
    console.log(req.body);
    console.log(req.headers.authorization);
    var user = jwt.decode(req.headers.authorization, JWT_SECRET);
    console.log(user);
    var contact = new Contact({
        name: req.body.name,
        email: req.body.email,
        contactnumber: req.body.number,
        addedBy: {
            id: user._id,
            name: user.name
        }
    });
    console.log(contact);
    contact.save(function (err) {
        if(err)
            throw err;
    })
    res.send({message: "Data Added"})
});
app.get("/contacts/receive",function (req,res) {
    Contact.find(function (err,contacts) {
        if(err)
            throw err;
        console.log(contacts)
        res.send(contacts);
    })
})
app.listen(PORT, function () {
    console.log("Server running on port 3000");
})















