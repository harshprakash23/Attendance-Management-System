const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const { createObjectCsvStringifier } = require('csv-writer');
const { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType } = require('docx');
const pool = require('../config/db');

router.post('/form/insert', async (req, res) => {
  const {
    name, registerNumber, year, branch, dob, gender, community, minority, bloodGroup, aadhar, mobile, email
  } = req.body;

  if (!name || !registerNumber || !year || !branch || !dob || !gender || !mobile || !email) {
    return res.status(400).json({ message: 'Missing required fields: name, registerNumber, year, branch, dob, gender, mobile, email' });
  }

  if (isNaN(parseInt(year)) || new Date(dob).toString() === 'Invalid Date') {
    return res.status(400).json({ message: 'Invalid year or date of birth' });
  }

  try {
    await pool.query('SELECT 1');
    await pool.query(
      'INSERT INTO students (name, register_number, year_of_study, branch, dob, gender, community, minority, blood_group, aadhar, mobile, email) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        name || null,
        registerNumber || null,
        parseInt(year) || null,
        branch || null,
        dob || null,
        gender || null,
        community || null,
        minority || 'No',
        bloodGroup || null,
        aadhar || null,
        mobile || null,
        email || null
      ]
    );
    res.status(200).json({ message: 'Student added successfully' });
  } catch (error) {
    console.error('Error inserting student:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ message: `Student with register_number ${registerNumber} already exists` });
    } else if (error.code === 'ER_NO_SUCH_TABLE') {
      res.status(500).json({ message: 'Database table "students" does not exist' });
    } else {
      res.status(500).json({ message: `Error adding student: ${error.message}` });
    }
  }
});

router.get('/read', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT s.*, a.date AS lastAttendance, a.status
      FROM students s
      LEFT JOIN (
        SELECT student_id, date, status
        FROM attendance
        WHERE (student_id, date) IN (
          SELECT student_id, MAX(date)
          FROM attendance
          GROUP BY student_id
        )
      ) a ON s.id = a.student_id
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: `Error fetching students: ${error.message}` });
  }
});

router.get('/remove/getStudent/:registerNumber', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM students WHERE register_number = ?', [req.params.registerNumber]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ message: `Error fetching student: ${error.message}` });
  }
});

router.delete('/remove/delete/:registerNumber', async (req, res) => {
  try {
    await pool.query('DELETE FROM attendance WHERE student_id = (SELECT id FROM students WHERE register_number = ?)', [req.params.registerNumber]);
    await pool.query('DELETE FROM students WHERE register_number = ?', [req.params.registerNumber]);
    res.status(200).json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ message: `Error deleting student: ${error.message}` });
  }
});

router.post('/attendance', async (req, res) => {
  const { attendance } = req.body;
  try {
    for (const record of attendance) {
      await pool.query(
        'INSERT INTO attendance (student_id, date, status) VALUES (?, ?, ?)',
        [record.studentId, record.date, record.status]
      );
    }
    res.status(200).json({ message: 'Attendance submitted successfully' });
  } catch (error) {
    console.error('Error submitting attendance:', error);
    res.status(500).json({ message: `Error submitting attendance: ${error.message}` });
  }
});

router.get('/data/download', async (req, res) => {
  const { startDate, endDate } = req.query;
  try {
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required', data: [] });
    }
    await pool.query('SELECT 1');
    const [rows] = await pool.query(
      'SELECT s.register_number, s.name, a.date, COALESCE(a.status, "absent") AS status ' +
      'FROM students s LEFT JOIN attendance a ON s.id = a.student_id ' +
      'WHERE (a.date BETWEEN ? AND ? OR a.date IS NULL)',
      [startDate, endDate]
    );
    if (rows.length === 0) {
      return res.status(200).json({ message: 'No attendance data found for the specified date range', data: [] });
    }
    const csvStringifier = createObjectCsvStringifier({
      header: [
        { id: 'register_number', title: 'Register Number' },
        { id: 'name', title: 'Name' },
        { id: 'date', title: 'Date' },
        { id: 'status', title: 'Status' }
      ]
    });
    const csvData = csvStringifier.stringifyRecords(rows.map(row => ({
      register_number: row.register_number || '',
      name: row.name || '',
      date: row.date || '',
      status: row.status || 'absent'
    })));
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=attendance.csv');
    res.send(csvStringifier.getHeaderString() + csvData);
  } catch (error) {
    console.error('Error generating CSV:', error);
    res.status(500).json({ message: `Error generating CSV: ${error.message}`, data: [] });
  }
});

router.get('/attendanceToday/:date', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT s.register_number, s.name, s.year_of_study, s.branch, COALESCE(a.status, "absent") AS status ' +
      'FROM students s LEFT JOIN attendance a ON s.id = a.student_id WHERE a.date = ?',
      [req.params.date]
    );
    const doc = new Document({
      sections: [{
        children: [
          new Paragraph({ text: `Attendance Report for ${req.params.date}`, heading: 'Title' }),
          new Table({
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph('Register Number')] }),
                  new TableCell({ children: [new Paragraph('Name')] }),
                  new TableCell({ children: [new Paragraph('Year')] }),
                  new TableCell({ children: [new Paragraph('Branch')] }),
                  new TableCell({ children: [new Paragraph('Status')] })
                ]
              }),
              ...rows.map(row => new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph(row.register_number || '')] }),
                  new TableCell({ children: [new Paragraph(row.name || '')] }),
                  new TableCell({ children: [new Paragraph(row.year_of_study?.toString() || '')] }),
                  new TableCell({ children: [new Paragraph(row.branch || '')] }),
                  new TableCell({ children: [new Paragraph(row.status || 'absent')] })
                ]
              }))
            ],
            width: { size: 100, type: WidthType.PERCENTAGE }
          })
        ]
      }]
    });
    const buffer = await Packer.toBuffer(doc);
    res.setHeader('Content-Disposition', `attachment; filename=attendance_${req.params.date}.docx`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.send(buffer);
  } catch (error) {
    console.error('Error generating Word document:', error);
    res.status(500).json({ message: `Error generating Word document: ${error.message}`, data: [] });
  }
});

router.get('/attendance/all', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT a.*, s.register_number, s.name
      FROM attendance a
      LEFT JOIN students s ON a.student_id = s.id
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    res.status(500).json({ message: `Error fetching attendance records: ${error.message}` });
  }
});

module.exports = router;