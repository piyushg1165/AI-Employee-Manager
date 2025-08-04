const { qdrantClient } = require('../db/qdrantdb.js');
const { getEmbedding } = require('../utils/transformer.js');
const { v4: uuidv4 } = require('uuid');
const { formatEmployee } = require('../utils/formatEmployee.js');

const uploadEmployee = async (req, res) => {

      
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

        res.status(200).json({ message: "Employee uploaded to Qdrant", result });
    } catch (error) {
        console.error('Error uploading employee:', error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports = { uploadEmployee };