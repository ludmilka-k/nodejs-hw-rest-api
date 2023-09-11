import { ctrlWrapper } from "../decorators/index.js";
import { HttpError } from "../helpers/index.js";
import Contact from "../models/Contact.js";

const getAllContacts = async (req, res) => {
    const result = await Contact.find({}, "-createdAt -updatedAt");

    // const result = await Contact.find();
    res.status(200).json(result);
};

const getContactById = async (req, res) => {
    const { contactId } = req.params;
    console.log("contactId: " + contactId)
    const result = await Contact.findById(contactId);
    // const result = await Contact.findOne({_id: id});
    if (!result) {
        throw HttpError(404, 'Not found');
    }
    res.status(200).json(result);
};

const removeContactById = async (req, res) => {
    const { contactId } = req.params;
    const result = await Contact.findByIdAndDelete(contactId);
    if (!result) {
        throw HttpError(404, 'Not found');
    }
    res.status(200).json({ message: 'contact deleted' });
};

const createContact = async (req, res) => {
    const result = await Contact.create(req.body);
    res.status(201).json(result);
};

const updateContactById = async (req, res) => {
    const { contactId } = req.params;
    const result = await Contact.findByIdAndUpdate(contactId, req.body, {new: true});
    if (!result) {
        throw HttpError(400, 'missing field');
    }
    res.status(200).json(result);
};

const updateStatusContact = async (req, res) => {
    const { contactId } = req.params;
    const { favorite } = req.body;
    if (favorite === undefined) {
        throw HttpError(400, 'missing field favorite');
    }
    const result = await Contact.findByIdAndUpdate(contactId, { favorite }, { new: true });
    if (!result) {
        throw HttpError(404, 'Not found');
    }
    res.status(200).json(result);
};

export default {
    getAllContacts: ctrlWrapper(getAllContacts),
    getContactById: ctrlWrapper(getContactById),
    removeContactById: ctrlWrapper(removeContactById),
    createContact: ctrlWrapper(createContact),
    updateContactById: ctrlWrapper(updateContactById),
    updateStatusContact: ctrlWrapper(updateStatusContact),
}