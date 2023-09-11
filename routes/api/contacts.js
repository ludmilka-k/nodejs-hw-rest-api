import express from 'express';
import ctrl from '../../controllers/contacts.js';
import * as schemas from '../../models/Contact.js';
import { validatedContacts, isValidId } from '../../middlewares/index.js';

const router = express.Router();

router.get('/', ctrl.getAllContacts);

router.get('/:contactId', isValidId , ctrl.getContactById);

router.post('/', validatedContacts(schemas.schemaValidation), ctrl.createContact);

router.delete('/:contactId', isValidId, ctrl.removeContactById);

router.put('/:contactId', isValidId, validatedContacts(schemas.schemaValidation),  ctrl.updateContactById);

router.patch('/:contactId/favorite', isValidId, validatedContacts(schemas.schemaUpdateFavorite), ctrl.updateStatusContact);

export default router;
