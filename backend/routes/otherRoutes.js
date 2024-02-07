import express from 'express';
import { contact, getDashboardStats, requestCourse } from '../controllers/otherControllers.js';
import { AuthorizeAdmin, isAuthenticated } from '../middlewares/auth.js';

const router = express.Router();

router.route('/contact').post(contact);
router.route('/reqestCourse').post(requestCourse);
router.route('/reqestCourse').post(requestCourse);
router.route('/admin/stats').get(isAuthenticated,AuthorizeAdmin,getDashboardStats);



export default router;