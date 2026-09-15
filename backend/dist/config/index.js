"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
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
