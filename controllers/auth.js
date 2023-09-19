import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ctrlWrapper } from "../decorators/index.js";
import { HttpError } from "../helpers/index.js";
import User from "../models/User.js";

const { JWT_SECRET } = process.env;

const register = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user) {
        throw HttpError(409, "Email already exist");
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ ...req.body, password: hashPassword });

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

export default {
    register: ctrlWrapper(register),
    login: ctrlWrapper(login),
    getCurrent: ctrlWrapper(getCurrent),
    logout: ctrlWrapper(logout),
    patchSubscription: ctrlWrapper(patchSubscription),
}