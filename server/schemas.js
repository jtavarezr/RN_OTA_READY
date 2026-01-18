const Joi = require('joi');

const experienceSchema = Joi.object({
    title: Joi.string().allow('').optional(),
    company: Joi.string().allow('').optional(),
    dates: Joi.string().allow('').optional(),
    description: Joi.string().allow('').optional(),
    isCurrent: Joi.boolean().optional()
});

const educationSchema = Joi.object({
    degree: Joi.string().allow('').optional(),
    institution: Joi.string().allow('').optional(),
    dates: Joi.string().allow('').optional()
});

const projectSchema = Joi.object({
    name: Joi.string().allow('').optional(),
    description: Joi.string().allow('').optional(),
    tech: Joi.string().allow('').optional(),
    link: Joi.string().allow('').optional()
});

const languageSchema = Joi.object({
    name: Joi.string().allow('').optional(),
    level: Joi.string().allow('').optional()
});

const certificationSchema = Joi.object({
    name: Joi.string().allow('').optional(),
    issuer: Joi.string().allow('').optional(),
    year: Joi.string().allow('').optional()
});

const volunteeringSchema = Joi.object({
    role: Joi.string().allow('').optional(),
    organization: Joi.string().allow('').optional()
});

const awardSchema = Joi.object({
    name: Joi.string().allow('').optional(),
    issuer: Joi.string().allow('').optional()
});

const linksSchema = Joi.object({
    github: Joi.string().allow('').optional(),
    linkedin: Joi.string().allow('').optional(),
    portfolio: Joi.string().allow('').optional()
});

const profileSchema = Joi.object({
    userId: Joi.string().required(),
    fullName: Joi.string().min(2).max(255).optional(),
    email: Joi.string().email().optional(),
    phoneNumber: Joi.string().max(50).allow('').optional(),
    country: Joi.string().max(100).allow('').optional(),
    city: Joi.string().max(100).allow('').optional(),
    headline: Joi.string().max(255).allow('').optional(),
    summary: Joi.string().max(2000).allow('').optional(),
    profilePicture: Joi.string().uri().allow('').optional(),
    bannerImage: Joi.string().uri().allow('').optional(),
    skills: Joi.array().items(Joi.string()).optional(),
    hobbies: Joi.string().allow('').optional(),
    salaryExpectation: Joi.string().allow('').optional(),
    
    experience: Joi.array().items(experienceSchema).optional(),
    education: Joi.array().items(educationSchema).optional(),
    projects: Joi.array().items(projectSchema).optional(),
    languages: Joi.array().items(languageSchema).optional(),
    certifications: Joi.array().items(certificationSchema).optional(),
    volunteering: Joi.array().items(volunteeringSchema).optional(),
    awards: Joi.array().items(awardSchema).optional(),
    
    links: linksSchema.optional(),
    emailVerified: Joi.boolean().optional(),
    completionPercentage: Joi.number().min(0).max(100).optional()
});

module.exports = {
    profileSchema
};
