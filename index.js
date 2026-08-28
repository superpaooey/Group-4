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

app.patch ("/students/:index", (request, response) =>{
    const studentIndex = request.params;
    const updatedStudentData = request.body;

})

app.delete("/students", (request, response) => {
    
});

app.listen(3000, () => {
    console.log("listening to Port 3000");
});

