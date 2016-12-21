/**
 * Created by vikash on 21-Dec-16.
 */
var mongoose = require('mongoose');
var ContactSchema = mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true,
        unique : true
    },
    contactnumber : {
        type : String,
        required : true
    },
    addedBy : {
        id : {
            type : String,
            required : true
        },
        name : {
            type : String,
            required : true
        }
    }

});
module.exports = mongoose.model('Contact',ContactSchema);
