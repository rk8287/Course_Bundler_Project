import express from 'express';
import { addLeactures, createCourse, deleteCourse, deleteLeacture, getAllCourses, getCourseLeacture } from '../controllers/courseControllers.js';
import singleUpload from '../middlewares/multer.js';
import { AuthorizeAdmin, AuthorizeSubscriber, isAuthenticated } from '../middlewares/auth.js';

const router = express.Router();

router.route('/courses').get(getAllCourses);

router.route('/createCourse').post(isAuthenticated, AuthorizeAdmin, singleUpload, createCourse);

router.route('/course/:id').get(isAuthenticated,AuthorizeSubscriber, getCourseLeacture)
.post(isAuthenticated, AuthorizeAdmin, singleUpload, addLeactures).delete(isAuthenticated, AuthorizeAdmin, deleteCourse);


//Delete Leacture

router.route('/leacture').delete(isAuthenticated, AuthorizeAdmin, deleteLeacture);

export default router;
