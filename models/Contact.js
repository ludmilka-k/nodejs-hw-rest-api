import { Schema, model } from 'mongoose';
import Joi from "joi";
import JoiPhoneNumber from 'joi-phone-number';
import {handleMongooseError, runValidateAtUpdate} from "../helpers/index.js";

const contactSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Set name for contact'],
  },
  email: {
    type: String,
    unique: true,
  },
  phone: {
    type: String,
  },
  favorite: {
    type: Boolean,
    default: false,
  },
}, { versionKey: false, timestamps: true });

contactSchema.post("save", handleMongooseError);
contactSchema.pre("findOneAndUpdate", runValidateAtUpdate);
contactSchema.post("findOneAndUpdate", handleMongooseError);

const myCustomJoi = Joi.extend(JoiPhoneNumber)

export const schemaValidation = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  email: Joi.string().email({ minDomainSegments: 2}).required(),
  phone: myCustomJoi.string().phoneNumber().required(),
  favorite: Joi.boolean().default(false),
});

export const schemaUpdateFavorite = Joi.object({
  favorite: Joi.boolean().required().messages({ 'any.required': `Missing field favorite` }),
});

const Contact = model('contact', contactSchema);
// categories => category!?!

export default Contact;






// const listContacts = async () => {
//   const data = await fs.readFile(contactsPath)
//   return JSON.parse(data)
// };
//
// const getById = async (id) => {
//   const allContacts = await listContacts();
//   const searchedContact = allContacts.find(item => item.id === id);
//   return searchedContact || null;
// }
//
// const removeContact = async (id) => {
//   const allContacts = await listContacts();
//   const index = allContacts.findIndex(item => item.id === id);
//   if (index === -1) {
//     return null;
//   }
//   const [result] = allContacts.splice(index, 1);
//   await fs.writeFile(contactsPath, JSON.stringify(allContacts, null, 2));
//   return result;
// }
//
// const addContact = async (body) => {
//   const { name, email, phone } = body
//   const allContacts = await listContacts();
//   const newContact = { id: nanoid(), name, email, phone };
//   allContacts.push(newContact);
//   await fs.writeFile(contactsPath, JSON.stringify(allContacts, null, 2));
//   return newContact || null;
// }
//
// const updateContact = async (id, toUpdate) => {
//   const allContacts = await listContacts();
//   const index = allContacts.findIndex(item => item.id === id);
//   if (index === -1) {
//     return null;
//   }
//   const updatedContact = Object.assign(allContacts[index], toUpdate);
//   allContacts.splice(index, 1, updatedContact);
//   await fs.writeFile(contactsPath, JSON.stringify(allContacts, null, 2));
//   return updatedContact;
// }

// export default {
//   listContacts,
//   getById,
//   removeContact,
//   addContact,
//   updateContact,
// }
