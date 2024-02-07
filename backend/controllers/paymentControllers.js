import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import { User } from "../models/User.js";
import ErrorHandler from "../utils/errorHandler.js";
import { instance } from '../server.js';
import {Payment} from '../models/paymentModel.js'

import crypto from 'crypto';

export const buySubscription = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user._id);

    if (user.role === 'admin') {
        return next(new ErrorHandler('Admin cannot buy a subscription!'));
    }

    const plan_id = process.env.PLAN_ID || 'plan_NB40MDKFJ8HDJK';

    const subscription = await instance.subscriptions.create({
        plan_id,
        customer_notify: 1,
        total_count: 12,
    });

    user.subscription = {
        id: subscription.id,
        status: subscription.status,
    };

    await user.save();

    res.status(201).json({
        success: true,
        subscriptionId: subscription.id
    });
});

// Verify Payment
export const paymentVerification = catchAsyncErrors(async (req, res, next) => {
   
    const { razorpay_signature, razorpay_payment_id, razorpay_subscription_id } = req.body;

    const user = await User.findById(req.user._id);
    const subscription_id = user.subscription.id;

    const generate_signature = crypto
        .createHmac("sha256", process.env.RAZAR_PAY_SECRET_KEY)
        .update(razorpay_payment_id + "|" + subscription_id, "utf-8")
        .digest('hex');

    const isAuthentic = generate_signature === razorpay_signature;

    if (!isAuthentic) return res.redirect(`${process.env.FRONTEND_URL}/paymentFail`);

    // Database save
    await Payment.create({
        razorpay_signature,
        razorpay_payment_id,
        razorpay_subscription_id
    });

    user.subscription.status = 'active';
    await user.save();

    res.redirect(`${process.env.FRONTEND_URL}/paymentSuccess?reference=${razorpay_payment_id}`);
});

export const getRazorpaykey = catchAsyncErrors(async (req, res, next) => {
    res.status(200).json({
        success: true,
        key: process.env.RAZAR_PAY_API_KEY
    });
});

// Cancel and Refund Subscription
export const cancelSubscription = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user._id);
    const subscriptionId = user.subscription.id;
    let refund = false;

    await instance.subscriptions.cancel(subscriptionId);

    const payment = await Payment.findOne({
        razorpay_subscription_id: subscriptionId,
    });

    const gap = Date.now() - payment.createdAt;
    const refundTime = process.env.REFUND_DAYS * 24 * 60 * 60 * 1000;

    if (refundTime > gap) {
        await instance.payments.refund(payment.razorpay_payment_id);
        refund = true;
    }

    await payment.deleteOne();

    user.subscription.id = undefined;
    user.subscription.status = undefined;

    await user.save();

    res.status(200).json({
        success: true,
        message: refund ? 'Subscription Cancelled, You will receive a full refund within 7 days' : 'Subscription cancelled'
    });
});