import { catchAsyncErrors } from '../middlewares/catchAsyncErrors.js';
import { Course } from '../models/Course.js';
import getDataUri from '../utils/dataUri.js';
import ErrorHandler from '../utils/errorHandler.js';
import cloudinary from 'cloudinary';

export const getAllCourses = catchAsyncErrors(async (req, res, next) => {
   const { category, keyword } = req.query;

   let filter = {};

   if (category) {
      filter.category = category;
   }

   if (keyword) {
      filter.title = { $regex: keyword, $options: 'i' }; // Case-insensitive search
   }

   const courses = await Course.find(filter).select('-lectures');

   res.status(200).json({
      success: true,
      courses,
   });
});

//Create Course

export const createCourse = catchAsyncErrors(async (req, res, next) => {
    const { title, description, category, createdBy } = req.body;

    if (!title || !description || !category || !createdBy) {
        return next(new ErrorHandler('Please add all fields', 400));
    }

    const file = req.file;
    const fileUri = getDataUri(file);

    const myCloud = await cloudinary.v2.uploader.upload(fileUri.content);

    await Course.create({
        title,
        description,
        category,
        createdBy,
        poster: {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
        }
    });

    res.status(201).json({
        success: true,
        message: 'Course Created Successfully. Now you Can add Lectures'
    });
});

//Get Course Leacture

export const getCourseLeacture = catchAsyncErrors(async (req, res, next) => {
    const course = await Course.findById(req.params.id);

    if (!course) return next(new ErrorHandler('Course not found', 404));

    course.views += 1;

    await course.save();

    res.status(200).json({
        success: true,
        lectures: course.leactures,
    });
});

//Add leacture

export const addLeactures = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    const { title, description } = req.body;
    const course = await Course.findById(id);

    if (!course) return next(new ErrorHandler('Course not found', 404));

    const file = req.file;
    const fileUri = getDataUri(file);

    const myCloud = await cloudinary.v2.uploader.upload(fileUri.content, {
        resource_type: 'video'
    });

    const lectureData = {
        title,
        description,
        video: {
            url: myCloud.secure_url,
            public_id: myCloud.public_id,
        },
    };

    course.leactures.push(lectureData);

    course.numOfVideos = course.leactures.length;
    await course.save();

    res.status(200).json({
        success: true,
        message: 'Lecture added successfully',
    });
});

//Delete Course

export const deleteCourse = catchAsyncErrors(async(req,res,next)=>{

    const {id} = req.params;
    const course = await Course.findById(id)


    if(!course) return next(new ErrorHandler('Course not Found!',404));

    await cloudinary.v2.uploader.destroy(course.poster.public_id);

for (let i = 0; i < course.leactures.length; i++) {
    const singleLeacture = course.leactures[i];

await cloudinary.v2.uploader.destroy(singleLeacture.video.public_id,{
    resource_type:'video'
});
  
};

await course.deleteOne();

course.numOfVideos = course.leactures.length;


res.status(200).json({
    success:true,
    message:'Course Deleted Successfully!'
})

});

//Delete Leacture 

export const deleteLeacture = catchAsyncErrors(async(req,res,next)=>{

    const {courseId,leactuerId} = req.query;
    
    const course = await Course.findById(courseId)

  if(!course) return next(new ErrorHandler('Course not Found!',404));



  course.leacture = course.leactures.find((item)=>{

    if(item._id.toString() === leactuerId.toString()) return item;
    });
    
    await cloudinary.v2.uploader.destroy(course.leacture.video.public_id, {
        resource_type: 'video'
    });
    
      
course.leactures = course.leactures.filter((item)=>{

if(item._id.toString() !== leactuerId.toString()) return item;
});

course.numOfVideos = course.leactures.length;

await course.save();

res.status(200).json({
    success:true,
    message:'Leacture Deleted Successfully!'
})

});





