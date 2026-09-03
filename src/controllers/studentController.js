import {
  getAllStudents,
  addStudent,
  getStudentByIndex,
  updateStudentAtIndex,
  deleteStudentAtIndex,
  clearStudents,
  studentCount,
} from '../models/studentModel.js';

export const listStudents = (request, response) => {
  response.send(getAllStudents());
};

export const createStudent = (request, response) => {
  const newStudent = request.body;
  addStudent(newStudent);
  response.status(201).send(newStudent);
};

export const updateStudent = (request, response) => {
  const studentIndex = Number(request.params.index);
  const updatedStudentData = request.body;

  if (Number.isNaN(studentIndex) || studentIndex < 0 || studentIndex >= studentCount()) {
    return response.status(404).send({ message: 'Student not found' });
  }

  const updatedStudent = updateStudentAtIndex(studentIndex, updatedStudentData);
  response.send(updatedStudent);
};

export const removeStudent = (request, response) => {
  const studentIndex = Number(request.params.index);

  if (Number.isNaN(studentIndex) || studentIndex < 0 || studentIndex >= studentCount()) {
    return response.status(404).send({ message: 'Student not found' });
  }

  const deletedStudent = deleteStudentAtIndex(studentIndex);
  response.send({ deletedStudent });
};

export const removeAllStudents = (request, response) => {
  clearStudents();
  response.send({ message: 'All students deleted' });
};

export const getStudent = (request, response) => {
  const studentIndex = Number(request.params.index);
  const student = getStudentByIndex(studentIndex);

  if (student === undefined) {
    return response.status(404).send({ message: 'Student not found' });
  }

  response.send(student);
};
