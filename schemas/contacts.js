import Joi from 'joi';
import JoiPhoneNumber from 'joi-phone-number';

const myCustomJoi = Joi.extend(JoiPhoneNumber)

const schemaValidation = Joi.object({
    name: Joi.string().min(3).max(30).required(),
    email: Joi.string().email({ minDomainSegments: 2}).required(),
    phone: myCustomJoi.string().phoneNumber().required(),
});

export default schemaValidation;