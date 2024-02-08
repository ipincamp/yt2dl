import Joi from "joi";

function apiValidation(input: any) {
  const schema = Joi.object<{ url: string }>({
    url: Joi.string().required(),
  });

  return schema.validate(input);
}

export default apiValidation;
