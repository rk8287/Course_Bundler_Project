import express from 'express';
import { addToPlaylist, changePassword, deleteMyProfile, deleteUser, getAllUsers, getMyProfile, login,
 logout, register, removePlaylist, updateProfile, updateProfilePicture, updateUserRole } from '../controllers/userControllers.js'; 
import { AuthorizeAdmin, isAuthenticated } from '../middlewares/auth.js';
import singleUpload from '../middlewares/multer.js';

const router = express.Router();

router.route('/register').post(singleUpload,register);

router.route('/login').post(login);

router.route('/logout').get(logout);

router.route('/me').get(isAuthenticated,getMyProfile);

router.route('/me').delete(isAuthenticated,deleteMyProfile);

router.route('/changePassword').put(isAuthenticated,changePassword);

router.route('/updateProfile').put(isAuthenticated,updateProfile);

router.route('/updateProfilePicture').put(singleUpload,isAuthenticated,updateProfilePicture);

router.route('/addLeacture').post(isAuthenticated,addToPlaylist);

router.route('/removeLeacture').delete(isAuthenticated,removePlaylist);

// Admin Routes

router.route('/admin/Users').get(isAuthenticated,AuthorizeAdmin,getAllUsers);

router.route('/admin/user/:id').put(isAuthenticated,AuthorizeAdmin,updateUserRole).delete(isAuthenticated,AuthorizeAdmin,deleteUser);


export default router;
