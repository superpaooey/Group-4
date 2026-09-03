import express from 'express';
const app = express();

let students = [{name: "student1" }];

app.use(express.json());

app.get("/students", (request, response) => {
    response.send(students);
});

app.post("/students", (request, response) =>{
    const newStudent = request.body

    students = [...students, newStudent];
    response.send(newStudent);
});

app.patch("/students/:index", (request, response) => {
    const studentIndex = Number(request.params.index);
    const updatedStudentData = request.body;

    if (Number.isNaN(studentIndex) || studentIndex < 0 || studentIndex >= students.length) {
        return response.status(404).send({ message: "Student not found" });
    }

    students = students.map((student, index) =>
        index === studentIndex ? { ...student, ...updatedStudentData } : student
    );

    response.send(students[studentIndex]);
});

app.delete("/students/:index", (request, response) => {
    const studentIndex = Number(request.params.index);

    if (Number.isNaN(studentIndex) || studentIndex < 0 || studentIndex >= students.length) {
        return response.status(404).send({ message: "Student not found" });
    }

    const deletedStudent = students[studentIndex];
    students = students.filter((_, index) => index !== studentIndex);
    response.send({ deletedStudent });
});

app.delete("/students", (request, response) => {
    students = [];
    response.send({ message: "All students deleted" });
});

app.listen(3000, () => {
    console.log("listening to Port 3000");
});

