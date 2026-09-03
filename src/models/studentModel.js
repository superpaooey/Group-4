let students = [{ name: 'student1' }];

export const getAllStudents = () => students;

export const addStudent = (student) => {
  students = [...students, student];
  return student;
};

export const updateStudentAtIndex = (index, updates) => {
  students = students.map((student, currentIndex) =>
    currentIndex === index ? { ...student, ...updates } : student
  );

  return students[index];
};

export const deleteStudentAtIndex = (index) => {
  const deletedStudent = students[index];
  students = students.filter((_, currentIndex) => currentIndex !== index);
  return deletedStudent;
};

export const clearStudents = () => {
  students = [];
};

export const studentCount = () => students.length;

export const getStudentByIndex = (index) => students[index];
