import {
  getAllStudents,
  addStudent,
  getStudentByIndex,
  updateStudentAtIndex,
  deleteStudentAtIndex,
  clearStudents,
  studentCount,
} from '../models/studentModel.js';

export const listStudents = async (request, response) => {
  response.send(await getAllStudents());
};

export const createStudent = async (request, response) => {
  const newStudent = request.body ?? {};

  if (!newStudent.name || typeof newStudent.name !== 'string') {
    return response.status(400).send({ message: 'Student name is required' });
  }

  const createdStudent = await addStudent(newStudent);
  response.status(201).send(createdStudent);
};

export const updateStudent = async (request, response) => {
  const studentIndex = Number(request.params.index);
  const updatedStudentData = request.body ?? {};

  if (Number.isNaN(studentIndex) || studentIndex < 0 || studentIndex >= (await studentCount())) {
    return response.status(404).send({ message: 'Student not found' });
  }

  const updatedStudent = await updateStudentAtIndex(studentIndex, updatedStudentData);

  if (!updatedStudent) {
    return response.status(404).send({ message: 'Student not found' });
  }

  response.send(updatedStudent);
};

export const removeStudent = async (request, response) => {
  const studentIndex = Number(request.params.index);

  if (Number.isNaN(studentIndex) || studentIndex < 0 || studentIndex >= (await studentCount())) {
    return response.status(404).send({ message: 'Student not found' });
  }

  const deletedStudent = await deleteStudentAtIndex(studentIndex);
  response.send({ deletedStudent });
};

export const removeAllStudents = async (request, response) => {
  await clearStudents();
  response.send({ message: 'All students deleted' });
};

export const getStudent = async (request, response) => {
  const studentIndex = Number(request.params.index);
  const student = await getStudentByIndex(studentIndex);

  if (student === undefined) {
    return response.status(404).send({ message: 'Student not found' });
  }

  response.send(student);
};
