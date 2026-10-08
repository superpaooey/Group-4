import {
  getAllStudents,
  addStudent,
  getStudentById,
  updateStudentById,
  deleteStudentById,
  clearStudents,
} from '../models/studentModel.js';
import { validateStudentData } from '../validations/studentValidation.js';

const parseStudentId = (value) => {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
};

export const listStudents = async (request, response) => {
  response.send(await getAllStudents());
};

export const createStudent = async (request, response) => {
  const newStudent = request.body ?? {};
  const validationError = validateStudentData(newStudent);

  if (validationError) {
    return response.status(400).send({ message: validationError });
  }

  const createdStudent = await addStudent(newStudent);
  response.status(201).send(createdStudent);
};

export const updateStudent = async (request, response) => {
  const studentId = parseStudentId(request.params.id);
  const updatedStudentData = request.body ?? {};
  const validationError = validateStudentData(updatedStudentData);

  if (!studentId) {
    return response.status(400).send({ message: 'Student ID must be a positive integer' });
  }

  if (validationError) {
    return response.status(400).send({ message: validationError });
  }

  const updatedStudent = await updateStudentById(studentId, updatedStudentData);

  if (!updatedStudent) {
    return response.status(404).send({ message: 'Student not found' });
  }

  response.send(updatedStudent);
};

export const removeStudent = async (request, response) => {
  const studentId = parseStudentId(request.params.id);

  if (!studentId) {
    return response.status(400).send({ message: 'Student ID must be a positive integer' });
  }

  const deletedStudent = await deleteStudentById(studentId);
  if (!deletedStudent) {
    return response.status(404).send({ message: 'Student not found' });
  }

  response.send({ deletedStudent });
};

export const removeAllStudents = async (request, response) => {
  await clearStudents();
  response.send({ message: 'All students deleted' });
};

export const getStudent = async (request, response) => {
  const studentId = parseStudentId(request.params.id);

  if (!studentId) {
    return response.status(400).send({ message: 'Student ID must be a positive integer' });
  }

  const student = await getStudentById(studentId);

  if (!student) {
    return response.status(404).send({ message: 'Student not found' });
  }

  response.send(student);
};
