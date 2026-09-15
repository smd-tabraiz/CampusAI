import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || 'file:./campusai.db',
  jwtSecret: process.env.JWT_SECRET || 'campusai_super_secret_jwt_key_2026_production_grade',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',

  // IBM watsonx / IBM Bob AI Integration
  ibmApiKey: process.env.IBM_API_KEY || '',
  ibmProjectId: process.env.IBM_PROJECT_ID || '',
  ibmUrl: process.env.IBM_URL || 'https://us-south.ml.cloud.ibm.com',
};
