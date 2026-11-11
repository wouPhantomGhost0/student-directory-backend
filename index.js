const express = require('express');
const mongoose = require('mongoose');
const app = express();
app.use(express.json());


const DepartmentSchema = new mongoose.Schema({ name: String, code: String });
const Department = mongoose.model('Department', DepartmentSchema);

const StudentSchema = new mongoose.Schema({
  name: String,
  email: String,
  gpa: Number,
  status: String,
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' }
});
const Student = mongoose.model('Student', StudentSchema);


app.get('/api/students', async (req, res) => {
  try {
    const students = await Student.find().populate('departmentId', 'name code -_id');
    res.json({ success: true, data: students });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


app.get('/api/stats/department-gpa', async (req, res) => {
  try {
    const stats = await Student.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$departmentId', totalStudents: { $sum: 1 }, avgGpa: { $avg: '$gpa' } } },
      { $sort: { avgGpa: -1 } }
    ]);
    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));