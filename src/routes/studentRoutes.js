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
router.get('/:id', getStudent);
router.post('/', createStudent);
router.patch('/:id', updateStudent);
router.delete('/:id', removeStudent);
router.delete('/', removeAllStudents);

export default router;
