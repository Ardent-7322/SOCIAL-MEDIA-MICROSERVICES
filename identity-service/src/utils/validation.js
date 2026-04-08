const Joi = require('joi');

const validateRegistration = (data) => {
  const schema = Joi.object({
    username: Joi.string().min(3).max(50).required(),
    name: Joi.string().min(3).max(50).required(), 
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    bio: Joi.string().max(200).optional(),        
  });
  return schema.validate(data, { abortEarly: false });
};


const validatelogin = (data)=>{
    const schema = Joi.object({
        identifier: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
    });
    return schema.validate(data);
};

module.exports  = {validateRegistration ,validatelogin};