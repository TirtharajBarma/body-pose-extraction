import express from 'express';
import {
  getAllRecords,
  getRecordById,
  updateRecord,
  deleteRecord
} from '../controllers/records.controller.js';

const router = express.Router();

router.get('/records', getAllRecords);
router.get('/records/:id', getRecordById);
router.put('/records/:id', updateRecord);
router.delete('/records/:id', deleteRecord);

export default router;
