const { qdrantClient } = require('../db/qdrantdb.js');
const { getEmbedding } = require('../utils/transformer.js');
const { v4: uuidv4 } = require('uuid');
const { formatEmployee } = require('../utils/formatEmployee.js');
const fs = require('fs');
const xlsx = require('xlsx');
const { pgPool } = require("../db/postgres.js");

const uploadSingleEmployee = async (req, res) => {
  try {
     const emp = {
            employee_id,
            name,
            email,
            phone,
            position,
            joining_date,
            employment_type,
            department,
            location,
            manager,
            experience_years,
            is_remote,
            skills,
            projects
        } = req.body;

    const text = formatEmployee(emp);
    const raw = await getEmbedding(text);

    const vector = Array.from(raw[0].data);

 

     if (
            !employee_id || !name || !email || !phone || !position ||
            !joining_date || !employment_type || !department ||
            !location || !manager || experience_years === undefined ||
            is_remote === undefined || !skills || !projects
        ) {
            return res.status(400).json({ message: "All fields are required" });
        }

           const embeddingInput = [
            name,
            position,
            department,
            skills.join(', '),
            projects.join(', ')
        ].join(' | ');
        const embedding = await getEmbedding(embeddingInput);

     const payload = {
            employee_id,
            name,
            email,
            phone,
            position,
            joining_date,
            employment_type,
            department,
            location,
            manager,
            experience_years,
            is_remote,
            skills,
            projects
        };


          const result = await qdrantClient.upsert('employees', {
            points: [
                {
                    id: uuidv4(),
                    vector: vector,
                    payload
                }
            ]
        });


    res.status(200).json({ message: 'Employee uploaded to Qdrant', result });

  }  catch (error) {
        console.error('Error uploading employee:', error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const uploadEmployeesFromExcel = async (req, res) => {
  
  try {
    const filePath = req.file.path;
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const points = [];

    
    for (const employees of data) {
      const emp = {
        employee_id,
        name,
        email,
        phone,
        position,
        joining_date,
        employment_type,
        department,
        location,
        manager,
        experience_years,
        is_remote,
        skills,
        projects
      } = employees;

      const text = formatEmployee(emp);
      const raw = await getEmbedding(text);

          const vector = Array.from(raw[0].data);



      if (
        !employee_id || !name || !email || !phone || !position ||
        !joining_date || !employment_type || !department ||
        !location || !manager || experience_years === undefined ||
        is_remote === undefined || !skills || !projects
      ) {
        console.warn(`Skipping employee with missing fields: ${JSON.stringify(emp)}`);
        continue; 
      }

      
      const embeddingInput = [
        name,
        position,
        department,
        Array.isArray(skills) ? skills.join(', ') : skills,
        Array.isArray(projects) ? projects.join(', ') : projects
      ].join(' | ');

      const embedding = await getEmbedding(embeddingInput);

      if (!embedding || !Array.isArray(embedding)) {
        console.warn(`Skipping employee due to embedding error: ${employee_id}`);
        continue;
      }

      const payload = {
        employee_id,
        name,
        email,
        phone,
        position,
        joining_date,
        employment_type,
        department,
        location,
        manager,
        experience_years,
        is_remote,
        skills,
        projects
      };

      points.push({
        id: uuidv4(),
        vector,
        payload
      });
    }

    if (points.length === 0) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ error: 'No valid employees to upload' });
    }

    await qdrantClient.upsert('employees', {
      wait: true,
      points
    });

    fs.unlinkSync(filePath);
    res.status(200).json({ message: `✅ ${points.length} employees uploaded to Qdrant.` });

  } catch (err) {
    console.log('❌ Excel upload error:', err);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
};

const uploadSingleEmployeeToNeon = async (req, res) => {
  try {
    const emp = {
      employee_id,
      name,
      email,
      phone,
      position,
      joining_date,
      employment_type,
      department,
      location,
      manager,
      experience_years,
      is_remote,
      skills,
      projects
    } = req.body;

    // ✅ Validation
    if (
      !employee_id || !name || !email || !phone || !position ||
      !joining_date || !employment_type || !department ||
      !location || !manager || experience_years === undefined ||
      is_remote === undefined || !skills || !projects
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // ✅ Insert into Neon (with UPSERT)
    const query = `
      INSERT INTO employees (
        id, name, email, phone, position, joining_date,
        employment_type, department, location, manager,
        experience_years, is_remote, skills, projects
      ) VALUES (
        $1,$2,$3,$4,$5,$6,
        $7,$8,$9,$10,
        $11,$12,$13,$14
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        phone = EXCLUDED.phone,
        position = EXCLUDED.position,
        joining_date = EXCLUDED.joining_date,
        employment_type = EXCLUDED.employment_type,
        department = EXCLUDED.department,
        location = EXCLUDED.location,
        manager = EXCLUDED.manager,
        experience_years = EXCLUDED.experience_years,
        is_remote = EXCLUDED.is_remote,
        skills = EXCLUDED.skills,
        projects = EXCLUDED.projects;
    `;

    await pgPool.query(query, [
      employee_id,
      name,
      email,
      phone,
      position,
      joining_date,
      employment_type,
      department,
      location,
      manager,
      experience_years,
      is_remote,
      skills,     
      projects    
    ]);

    res.status(200).json({ message: "✅ Employee uploaded to Neon Postgres" });

  } catch (error) {
    console.error("Error uploading employee:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
module.exports = {uploadEmployeesFromExcel , uploadSingleEmployee, uploadSingleEmployeeToNeon};
