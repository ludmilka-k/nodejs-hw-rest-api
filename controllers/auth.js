import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ctrlWrapper } from "../decorators/index.js";
import { HttpError, sendEmail } from "../helpers/index.js";
import User from "../models/User.js";
import path from 'path'
import fs from 'fs/promises';
import gravatar from 'gravatar';
import { nanoid } from "nanoid";

const { JWT_SECRET, BASE_URL } = process.env;

const avatarsPath = path.join( 'public', 'avatars')
const register = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user) {
        throw HttpError(409, "Email already exist");
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const avatarURL = gravatar.url(email);
    const verificationCode = nanoid();
    const newUser = await User.create({ ...req.body, password: hashPassword, avatarURL, verificationCode });

    const verifyEmail = {
        to: email,
        subject: "Verify email",
        html: `<a target="_blank" href="${BASE_URL}/api/auth/verify/${verificationCode}">Click to verify email</a>`,
    };
    await sendEmail(verifyEmail);

    res.status(201).json({
        email: newUser.email,
        subscription: newUser.subscription,
        avatarURL: newUser.avatarURL,
    });
};

const verify = async (req, res) => {
    const {verificationCode} = req.params;
    const user = await User.findOne({verificationCode});
    if (!user) {
        throw HttpError(404, 'Email not found');
    }
    await User.findByIdAndUpdate(user._id, {verify:true, verificationCode:""});
    res.status(200).json({
        message: 'Email verify success',
    });
};

const resendVerifyEmail = async (req, res) => {
    const {email} =req.body;
    const user = await User.findOne({ email });
    if (!user) {
        throw HttpError(404, 'Email not found');
    }
    if (user.verify) {
        throw HttpError(400, 'Email already verify');
    }
    const verifyEmail = {
        to: email,
        subject: "Verify email",
        html: `<a target="_blank" href="${BASE_URL}/api/auth/verify/${user.verificationCode}">Click to verify email</a>`,
    };
    await sendEmail(verifyEmail);

    res.status(200).json({
        message: "Verify email resend success",
    })
};

const login = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        throw HttpError(401, "Email or password invalid"); //  "Email is wrong"
    }
    if (!user.verify) {
        throw HttpError(401, "Email not verify"); //  "Email or password invalid"
    }
    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
        throw HttpError(401, "Email or password invalid"); //  "Password is wrong"
    }

    const payload = {
        id: user._id,
    };
    const token = jwt.sign(payload, JWT_SECRET,{ expiresIn: '23h' });
    await User.findByIdAndUpdate(user._id, {token});
    res.status(200).json({
        token,
    });
};

const getCurrent =  async (req, res) => {
    const { email, subscription } = req.user;
    res.status(200).json({
        email,
        subscription,
    });
};

const logout =  async (req, res) => {
    const { _id } = req.user;
    await User.findByIdAndUpdate(_id, {token: ""});
    res.status(200).json({
       message: "logout success"
    });
};

const patchSubscription = async (req, res) => {
    const { _id } = req.user;
    const { subscription } = req.body;
    // console.log(subscription);

    await User.findByIdAndUpdate(_id, { subscription });
    res.status(200).json({
        subscription,
    });
};

const updateAvatar = async (req, res) => {
    const { _id } = req.user;
    const { path: oldPath, originalname } = req.file;

    const filename = `${_id}_${originalname}`;
    const newPath = path.join(avatarsPath, filename);
    await fs.rename(oldPath, newPath);

    const avatarURL = path.join('avatars', filename);
    await User.findByIdAndUpdate(_id, { avatarURL });
    res.status(200).json({
        avatarURL,
    });
}

export default {
    register: ctrlWrapper(register),
    verify: ctrlWrapper(verify),
    resendVerifyEmail: ctrlWrapper(resendVerifyEmail),
    login: ctrlWrapper(login),
    getCurrent: ctrlWrapper(getCurrent),
    logout: ctrlWrapper(logout),
    patchSubscription: ctrlWrapper(patchSubscription),
    updateAvatar: ctrlWrapper(updateAvatar),
}