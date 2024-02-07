import { catchAsyncErrors } from '../middlewares/catchAsyncErrors.js'; 
import ErrorHandler from '../utils/errorHandler.js'; 
import { User } from '../models/User.js'; 
import { sendToken } from '../utils/sendToken.js'; 
import { Course } from '../models/Course.js';
import cloudinary from 'cloudinary';
import getDataUri from '../utils/dataUri.js';


//Register

export const register = catchAsyncErrors(async (req, res, next) => {


    const {name,email,password} = req.body;
    const file = req.file;


    if(!name || !email || !password || !file) return next(new ErrorHandler('Please Enter all fields!',400));

    let user = await User.findOne({email});


if(user) return next(new ErrorHandler('User already exists!',409));



const fileUri = getDataUri(file);

const myCloud = await cloudinary.v2.uploader.upload(fileUri.content, {
    resource_type: 'image' 
});

user = await User.create({
    name,
    email,
    password,
    avatar:{
        public_id:myCloud.public_id,
        url: myCloud.secure_url
    }
});

sendToken(res,user,'Registerd Successfully!',201);


});

// Login

export const login = catchAsyncErrors(async (req, res, next) => {
    const { email, password } = req.body;
  
    if (!email || !password) {
      return next(new ErrorHandler('Please Enter all fields!', 400));
    }
  
    let user = await User.findOne({ email }).select('+password');
  
    if (!user) {
      return next(new ErrorHandler('User doesn\'t exist!', 409));
    }
  
    const isMatch = await user.comparePassword(password);
  
    if (!isMatch) {
      return next(new ErrorHandler('Incorrect Email or Password!', 401));
    }
  
    const token = sendToken(res, user, `Welcome back ${user.name}`, 200);
  
    res.status(200).json({
      success: true,
      message: `Welcome back ${user.name}`,
      token,
    });
  });
  

//Logout

export const logout = catchAsyncErrors(async (req, res, next) => {
    res.status(200).cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true,
        secure:true,
        
    }).json({
        success: true,
        message: "Logout Successfully!"
    });
});


//User Profile

export const getMyProfile = catchAsyncErrors( async(req,res,next)=>{

    const user = await User.findById(req.user._id);

    res.status(200).json({
        success:true,
        user,
    })
});

//Change Password

export const changePassword = catchAsyncErrors( async(req,res,next)=>{

    const {oldPassword, newPassword} = req.body;

    
if(!oldPassword || !newPassword){
    return next(new ErrorHandler('Please enter all fields!',400))
}

const user = await User.findById(req.user._id).select('+password');

const isMatch = await user.comparePassword(oldPassword);

if(!isMatch){
    return next(new ErrorHandler('Incorrect old password!',401))
}

if(newPassword.length < 6){
    return next(new ErrorHandler('Password must be at least 6 characters!',401))
}

user.password = newPassword;

await user.save();


    res.status(200).json({
        success:true,
        message:'Password Change Successfully!',
    })
});


//Update Profile

export const updateProfile = catchAsyncErrors( async(req,res,next)=>{

const {name, email} = req.body;

    
const user = await User.findById(req.user._id);

if(name) user.name = name;
if(email) user.email = email;

await user.save();

    res.status(200).json({
        success: true,
        message:'Name && Password Change Successfully!',
    })
});

//Update Profile Picture

export const updateProfilePicture = catchAsyncErrors(async (req,res,next)=>{

    const user = await User.findById(req.user._id);

    const file = req.file;
    const fileUri = getDataUri(file);

    const myCloud = await cloudinary.v2.uploader.upload(fileUri.content, {
        resource_type: 'image'
    });

    await cloudinary.v2.uploader.destroy(user.avatar.public_id);

    user.avatar = {
        public_id: myCloud.public_id,
        url: myCloud.secure_url
    }

    await user.save();

    res.status(200).json({
        success:true,
        message:'Profile Picture Updated Successfully!'
    })
})

//add to Playlist

export const addToPlaylist = catchAsyncErrors(async (req,res,next)=>{


    const user = await User.findById(req.user._id);

    const course = await Course.findById(req.body.id);


if(!course) return next(new ErrorHandler('Course not found!',404));

const itemExist = user.playlist.find(item => item.course.toString() === course._id.toString())

if(itemExist) return next(new ErrorHandler('Course already exist!',409));

user.playlist.push({
    course: course._id,
    poster: course.poster.url

})

await user.save();

res.status(200).json({
    success:true,
    message:'Add to Playlist'
})

});

// Remove From Playlist

export const removePlaylist = catchAsyncErrors(async (req, res, next) => {
    const userId = req.user._id;
    const courseId = req.query.id; // Assuming the ID is in the query parameters
  
    const user = await User.findById(userId);
  
    if (!user) {
      return next(new ErrorHandler('User not found!', 404));
    }
  
    const course = await Course.findById(courseId);
  
    if (!course) {
      return next(new ErrorHandler('Course not found!', 404));
    }
  
    // Filter out the course from the playlist
    user.playlist = user.playlist.filter(item => item.course.toString() !== courseId);
  
    await user.save();
  
    res.status(200).json({
      success: true,
      message: 'Removed from Playlist!',
    });
  });
  
//Admin getAll Users

export const getAllUsers = catchAsyncErrors(async (req,res,next)=>{

    const users = await User.find({});


    res.status(200).json({
        success:true,
        users
    })
});

// Update User Role

export const updateUserRole = catchAsyncErrors(async (req,res,next)=>{

    const user =await User.findById(req.params.id);

    if(!user) return next(new ErrorHandler('User Not Found',404));

    if(user.role === 'user') user.role ='admin'
    else user.role = 'user'
    
    await user.save();

    res.status(200).json({
        success:true,
        message:'Role Updated Successfully!'
    })


});

//Admin Delete User 

export const deleteUser = catchAsyncErrors(async (req,res,next)=>{
    const user = await User.findById(req.params.id);


    if(!user) return next(new ErrorHandler('User Not Found',404));

    await cloudinary.v2.uploader.destroy(user.avatar.public_id);

    //Cancel Subscription



   await user.deleteOne()
    

    res.status(200).json({
        success:true,
        message:'User Deleted Successfully!'
    })

});



//Admin Delete User 

export const deleteMyProfile = catchAsyncErrors(async (req,res,next)=>{
    const user = await User.findById(req.user._id);


    await cloudinary.v2.uploader.destroy(user.avatar.public_id);

    //Cancel Subscription

   await user.deleteOne()
    

    res.status(200).cookie('token',null,{
        expires: new Date(Date.now())
    }).json({
        success:true,
        message:'Deleted Successfully!'
    })

});












