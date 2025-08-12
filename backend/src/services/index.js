// storeEmployeesToQdrant.js

const { employees} = require('../utils/employees.json');
const { formatEmployee } = require('../utils/formatEmployee.js');
const { qdrantClient } = require('../db/qdrantdb.js');
const { getEmbedding } = require('../utils/transformer.js');
const { v4: uuidv4 } = require('uuid');

async function storeEmployeesToQdrant() {
  await qdrantClient.recreateCollection('employees', {
    vectors: {
      size: 768,
      distance: 'Cosine',
    },
    optimizers_config: {
      default_segment_number: 1,
    },
    payload_schema: {
      description: { type: 'text' },
    },
  });

  for (const emp of employees) {
    const text = formatEmployee(emp);
    const raw = await getEmbedding(text);

    const vector = Array.from(raw[0].data);

    await qdrantClient.upsert('employees', {
      points: [
        {
          id: uuidv4(), // Use employee_id as id (string or number)
          vector: vector, // Should be a flat array of numbers
          payload: {
            ...emp,
            description: text,
            tags: [
              ...emp.skills,
              emp.position,
              emp.department,
              emp.manager,
              emp.location,
              emp.joining_date,
              emp.employment_type,
              emp.experience_years,
              emp.is_remote,
              emp.projects,
              emp.phone,
              emp.email,
              emp.name,
              emp.employee_id,
            ].join(', '),
          }, // Spread all employee fields
        },
      ],
    });

    console.log(`✅ Stored ${emp.name} in Qdrant`);
  }

  console.log('🎉 All employee data embedded and stored.');
}

module.exports = { storeEmployeesToQdrant };