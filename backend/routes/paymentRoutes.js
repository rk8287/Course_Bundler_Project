import express from 'express';
import { AuthorizeSubscriber, isAuthenticated } from '../middlewares/auth.js';
import { buySubscription, cancelSubscription, getRazorpaykey, paymentVerification } from '../controllers/paymentControllers.js';


const router = express.Router();

router.route('/payment').get(isAuthenticated, buySubscription);

router.route('/paymentVerification').post(isAuthenticated, paymentVerification);

router.route('/razorPaykey').get(getRazorpaykey); 

router.route('/cancelSubscription').delete(isAuthenticated, AuthorizeSubscriber, cancelSubscription);

export default router;





