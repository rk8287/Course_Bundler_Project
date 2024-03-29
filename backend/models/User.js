import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import validator from 'validator';
import bcrypt from 'bcrypt'

const schema = new mongoose.Schema({

    name: {
    type: String,
    required: [true, "Please Enter Name"],
    },

    email: {
        type: String,
        required: [true, "Please Enter Email"],
        unique: true,
        validate: validator.isEmail,

        },

        password: {
            type: String,
            required: [true, "Please Enter Password"],
            minlength: [6, 'Please Enter password at least 6 characters'],
            select: false
        },
        

        
    role: {
        type: String,
        enum: ['admin','user'],
        default: 'user',
        },

        subscription: {
            id: String,
            status: String
        },

        avatar: {
            public_id:{
                type: String,
                required: true,
            },
            url:{
                type: String,
                required: true,
            }
          
        },
        playlist:[
            {
               course:{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Course',
               },

               poster: String,
            },
       
        ],

        createdAt :{
            type: Date,
            default: Date.now
        },

        ResetPasswordToken : String,
        ResetPasswordExpire : String

});

schema.pre('save',async function(next){

if(!this.isModified('password')) return next();

   this.password = await bcrypt.hash(this.password,10);
   next()
});

schema.methods.getJwtToken = function(){

    return jwt.sign({_id: this._id},process.env.JWT_SECRET,{
        expiresIn:'15d',
    })

};

schema.methods.comparePassword = async function(password){
return await bcrypt.compare(password,this.password);

};


export const User = mongoose.model('User',schema);