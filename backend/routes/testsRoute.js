import express from 'express';
import { Test } from '../models/testModel.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

export default router;