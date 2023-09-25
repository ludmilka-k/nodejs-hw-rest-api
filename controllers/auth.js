import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ctrlWrapper } from "../decorators/index.js";
import { HttpError } from "../helpers/index.js";
import User from "../models/User.js";
import path from 'path'
import fs from 'fs/promises';
import gravatar from 'gravatar';

const { JWT_SECRET } = process.env;

const avatarsPath = path.join( 'public', 'avatars')
const register = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user) {
        throw HttpError(409, "Email already exist");
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const avatarURL = gravatar.url(email);
    const newUser = await User.create({ ...req.body, password: hashPassword, avatarURL });

    res.status(201).json({
        email: newUser.email,
        name: newUser.name,
    });
};

const login = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        throw HttpError(401, "Email or password invalid"); //  Email is wrong
    }
    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
        throw HttpError(401, "Email or password invalid"); //  Password is wrong
    }

    const payload = {
        id: user._id,
    };
    const token = jwt.sign(payload, JWT_SECRET,{ expiresIn: '23h' });
    await User.findByIdAndUpdate(user._id, {token});
    res.json({
        token,
    });
};

const getCurrent =  async (req, res) => {
    const { email, subscription } = req.user;
    res.json({
        email,
        subscription,
    });
};

const logout =  async (req, res) => {
    const { _id } = req.user;
    await User.findByIdAndUpdate(_id, {token: ""});
    res.json({
       message: "logout success"
    });
};

const patchSubscription = async (req, res) => {
    const { _id } = req.user;
    const { subscription } = req.body;
    // console.log(subscription);

    await User.findByIdAndUpdate(_id, { subscription });
    res.json({
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
    res.json({
        avatarURL,
    });
}

export default {
    register: ctrlWrapper(register),
    login: ctrlWrapper(login),
    getCurrent: ctrlWrapper(getCurrent),
    logout: ctrlWrapper(logout),
    patchSubscription: ctrlWrapper(patchSubscription),
    updateAvatar: ctrlWrapper(updateAvatar),
}