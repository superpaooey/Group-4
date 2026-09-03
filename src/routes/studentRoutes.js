import express from 'express';
import {
  listStudents,
  createStudent,
  getStudent,
  updateStudent,
  removeStudent,
  removeAllStudents,
} from '../controllers/studentController.js';

const router = express.Router();

router.get('/', listStudents);
router.get('/:index', getStudent);
router.post('/', createStudent);
router.patch('/:index', updateStudent);
router.delete('/:index', removeStudent);
router.delete('/', removeAllStudents);

export default router;
