import Joi from 'joi';

// User validation schemas
export const registerSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .trim()
    .required()
    .messages({
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 50 characters',
      'any.required': 'Name is required'
    }),
  
  email: Joi.string()
    .email()
    .lowercase()
    .trim()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  
  password: Joi.string()
    .min(6)
    .max(128)
    .required()
    .messages({
      'string.min': 'Password must be at least 6 characters long',
      'string.max': 'Password cannot exceed 128 characters',
      'any.required': 'Password is required'
    })
});

export const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .lowercase()
    .trim()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required'
    })
});

// Idea validation schemas
export const createIdeaSchema = Joi.object({
  title: Joi.string()
    .min(5)
    .max(200)
    .trim()
    .required()
    .messages({
      'string.min': 'Title must be at least 5 characters long',
      'string.max': 'Title cannot exceed 200 characters',
      'any.required': 'Title is required'
    }),
  
  description: Joi.string()
    .min(20)
    .max(5000)
    .trim()
    .required()
    .messages({
      'string.min': 'Description must be at least 20 characters long',
      'string.max': 'Description cannot exceed 5000 characters',
      'any.required': 'Description is required'
    }),
  
  category: Joi.string()
    .valid(
      'Technology', 'Healthcare', 'Education', 'Finance', 'E-commerce',
      'Entertainment', 'Food & Beverage', 'Travel', 'Real Estate', 'Sports',
      'Fashion', 'Environment', 'Social Impact', 'B2B Services', 'Other'
    )
    .required()
    .messages({
      'any.only': 'Please select a valid category',
      'any.required': 'Category is required'
    }),
  
  tags: Joi.array()
    .items(
      Joi.string()
        .max(50)
        .trim()
    )
    .max(10)
    .optional()
    .messages({
      'array.max': 'Maximum 10 tags allowed',
      'string.max': 'Each tag cannot exceed 50 characters'
    }),
  
  isPublic: Joi.boolean()
    .optional()
    .default(false)
});

export const updateIdeaSchema = Joi.object({
  title: Joi.string()
    .min(5)
    .max(200)
    .trim()
    .optional()
    .messages({
      'string.min': 'Title must be at least 5 characters long',
      'string.max': 'Title cannot exceed 200 characters'
    }),
  
  description: Joi.string()
    .min(20)
    .max(5000)
    .trim()
    .optional()
    .messages({
      'string.min': 'Description must be at least 20 characters long',
      'string.max': 'Description cannot exceed 5000 characters'
    }),
  
  category: Joi.string()
    .valid(
      'Technology', 'Healthcare', 'Education', 'Finance', 'E-commerce',
      'Entertainment', 'Food & Beverage', 'Travel', 'Real Estate', 'Sports',
      'Fashion', 'Environment', 'Social Impact', 'B2B Services', 'Other'
    )
    .optional()
    .messages({
      'any.only': 'Please select a valid category'
    }),
  
  tags: Joi.array()
    .items(
      Joi.string()
        .max(50)
        .trim()
    )
    .max(10)
    .optional()
    .messages({
      'array.max': 'Maximum 10 tags allowed',
      'string.max': 'Each tag cannot exceed 50 characters'
    }),
  
  isPublic: Joi.boolean()
    .optional(),
  
  reanalyze: Joi.boolean()
    .optional()
    .default(false)
});

// Profile validation schema
export const updateProfileSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .trim()
    .optional()
    .messages({
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 50 characters'
    }),
  
  avatar: Joi.string()
    .uri()
    .optional()
    .allow(null)
    .messages({
      'string.uri': 'Avatar must be a valid URL'
    }),
  
  preferences: Joi.object({
    emailNotifications: Joi.boolean().optional(),
    analysisReminders: Joi.boolean().optional(),
    weeklyReports: Joi.boolean().optional()
  }).optional()
});

// Query validation schemas
export const querySchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .optional()
    .default(1),
  
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .optional()
    .default(10),
  
  search: Joi.string()
    .max(200)
    .trim()
    .optional(),
  
  category: Joi.string()
    .valid(
      'Technology', 'Healthcare', 'Education', 'Finance', 'E-commerce',
      'Entertainment', 'Food & Beverage', 'Travel', 'Real Estate', 'Sports',
      'Fashion', 'Environment', 'Social Impact', 'B2B Services', 'Other'
    )
    .optional(),
  
  status: Joi.string()
    .valid('pending', 'analyzing', 'analyzed', 'failed')
    .optional(),
  
  sortBy: Joi.string()
    .valid('createdAt', 'updatedAt', 'title', 'successScore', 'likes', 'views')
    .optional()
    .default('createdAt'),
  
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .optional()
    .default('desc')
});

// MongoDB ObjectId validation
export const objectIdSchema = Joi.string()
  .pattern(/^[0-9a-fA-F]{24}$/)
  .required()
  .messages({
    'string.pattern.base': 'Invalid ID format'
  });

// Password pattern for stronger passwords
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;

// Enhanced password change schema
export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).max(128).pattern(passwordPattern).required()
    .messages({
      'string.pattern.base': 'New password must contain at least one uppercase letter, one lowercase letter, and one number',
    }),
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required()
    .messages({
      'any.only': 'Password confirmation does not match new password',
    }),
});

// Ideas query parameters validation
export const getIdeasQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  status: Joi.string().valid('pending', 'analyzing', 'analyzed', 'failed').optional(),
  category: Joi.string().valid(
    'Technology', 'Healthcare', 'Education', 'Finance', 'E-commerce',
    'Entertainment', 'Food & Beverage', 'Travel', 'Real Estate', 'Sports',
    'Fashion', 'Environment', 'Social Impact', 'B2B Services', 'Other'
  ).optional(),
  sortBy: Joi.string().valid('createdAt', 'title', 'category', 'status').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});

// Reports query parameters validation
export const getReportsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  format: Joi.string().valid('pdf', 'html').optional(),
  sortBy: Joi.string().valid('createdAt', 'title', 'downloadCount').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});

/**
 * Validate request body against schema
 */
export function validateBody<T>(data: any, schema: Joi.ObjectSchema): T {
  const { error, value } = schema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });
  
  if (error) {
    const errorMessage = error.details
      .map(detail => detail.message)
      .join(', ');
    throw new Error(errorMessage);
  }
  
  return value as T;
}

/**
 * Validate query parameters against schema
 */
export function validateQuery<T>(data: any, schema: Joi.ObjectSchema): T {
  const { error, value } = schema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
    convert: true
  });
  
  if (error) {
    const errorMessage = error.details
      .map(detail => detail.message)
      .join(', ');
    throw new Error(errorMessage);
  }
  
  return value as T;
}