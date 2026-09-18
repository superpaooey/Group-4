export const validateStudentData = (student) => {
  if (!student || typeof student !== 'object') {
    return 'Student data is required.';
  }

  if (!student.name || typeof student.name !== 'string' || !student.name.trim()) {
    return 'Student name is required.';
  }

  return null;
};

export default { validateStudentData };
