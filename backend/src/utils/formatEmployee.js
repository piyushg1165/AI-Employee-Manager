function formatEmployee(emp) {
  const {
    employee_id,
    name,
    email,
    phone,
    position,
    department,
    manager,
    location,
    joining_date,
    employment_type,
    experience_years,
    is_remote,
    skills = '',
    projects = [],
  } = emp;

  // Basic formatted fields
  const experienceText =
    experience_years >= 5
      ? `${name} is a highly experienced`
      : experience_years >= 3
        ? `${name} is a skilled`
        : experience_years >= 1
          ? `${name} is a promising`
          : `${name} is a budding`;

  const workModeText = is_remote
    ? `${name} works remotely and is an integral part of the distributed team.`
    : `${name} works from our ${location} office, collaborating closely with the team.`;

  const joiningText = `They joined the company on ${joining_date} and currently hold a ${employment_type} position.`;

  // Normalize skills if provided as comma-separated string
  const skillArray = Array.isArray(skills)
    ? skills
    : typeof skills === 'string'
      ? skills.split(',').map(s => s.trim()).filter(Boolean)
      : [];

  const skillText =
    skillArray.length > 0
      ? `${name}'s core technical skills include ${skillArray.join(', ')}.`
      : `${name} is continuously learning new technologies to expand their skill set.`;

  // Normalize projects if provided as comma-separated string
  const projectArray = Array.isArray(projects)
    ? projects
    : typeof projects === 'string'
      ? projects.split(',').map(p => p.trim()).filter(Boolean)
      : [];

  // ✅ Fixed: Use projectArray instead of projects
  const projectText =
    projectArray.length > 0
      ? `${name} has worked on key projects such as ${projectArray.join(', ')}.`
      : `${name} is looking forward to contributing to exciting projects.`;

  const contactText = `They can be contacted via email at ${email} or by phone at ${phone}.`;

  // Optional: Role-specific intro sentence
  const introTemplates = {
    'Frontend Developer': `${experienceText} frontend engineer who focuses on building responsive and performant interfaces.`,
    'Backend Developer': `${experienceText} backend developer who specializes in server-side logic and database systems.`,
    'Full Stack Developer': `${experienceText} full stack developer experienced in both client- and server-side technologies.`,
    'Software Intern': `${experienceText} software intern gaining hands-on experience in product development and coding best practices.`,
    'DevOps Engineer': `${experienceText} DevOps engineer responsible for infrastructure automation, CI/CD, and system reliability.`,
    default: `${experienceText} professional contributing to the ${department} department.`,
  };

  const intro = introTemplates[position] || introTemplates['default'];

  // Final paragraph
  return `
${intro} ${name} is currently working in the ${department} department, reporting to ${manager}. ${workModeText} ${joiningText} Their employee ID is ${employee_id}.

${skillText} ${projectText} ${contactText}
`.trim();
}

function extractFiltersAndBuildQdrant(text) {
  const filters = {};
  const lowerText = text.toLowerCase();

  // Manager
  const managerMatch = text.match(/manager (is|=|named)?\s*([\w\s]+)/i);
  if (managerMatch) filters.manager = managerMatch[2].trim();

  // Location
  const locationMatch = text.match(/(?:in|located in)\s+([\w\s]+)/i);
  if (locationMatch) filters.location = locationMatch[1].trim();

  // Name
  const nameMatch = text.match(/(?:named|name is|employee)\s+([\w\s]+)/i);
  if (nameMatch) filters.name = nameMatch[1].trim();

  // Position
  const positionMatch = text.match(/position (is|=)?\s*([\w\s]+)/i);
  if (positionMatch) filters.position = positionMatch[2].trim();

  // Department
  const deptMatch = text.match(/department (is|=)?\s*([\w\s]+)/i);
  if (deptMatch) filters.department = deptMatch[2].trim();

  // Employment type
  const employmentMatch = text.match(/(full[-\s]?time|part[-\s]?time|intern)/i);
  if (employmentMatch) {
    filters.employment_type = capitalize(employmentMatch[1].replace('-', ' '));
  }

  // Experience
  const expMatch = text.match(/(\d+)\s+years? of experience/i);
  if (expMatch) filters.experience_years = parseInt(expMatch[1]);

  // Remote
  if (lowerText.includes('remote')) filters.is_remote = true;
  else if (lowerText.includes('onsite') || lowerText.includes('office'))
    filters.is_remote = false;

  // Skills
  const skillList = [
    'React',
    'JavaScript',
    'HTML',
    'CSS',
    'Redux',
    'Node.js',
    'Express',
    'MongoDB',
    'TypeScript',
    'PostgreSQL',
    'Docker',
    'GraphQL',
    'AWS',
    'Kubernetes',
    'CI/CD',
    'Linux',
    'Firebase',
    'Jest',
  ];
  let matchedSkills = [];

  const regexSkillList = /skills?:?\s*([a-zA-Z0-9,\s\.\-]+)/i;
  const skillMatch = text.match(regexSkillList);
  if (skillMatch) {
    const rawSkills = skillMatch[1];
    matchedSkills = rawSkills
      .split(',')
      .map((s) => s.trim())
      .filter((s) => skillList.map(skill => skill.toLowerCase()).includes(s.toLowerCase()));

    if (matchedSkills.length > 0) filters.skills = matchedSkills;
  }

  // Qdrant-compatible filter object
  const qdrantFilter = {
    must: Object.entries(filters).map(([key, value]) => {
      if (Array.isArray(value)) {
        return { key, match: { any: value } };
      }
      if (typeof value === 'boolean' || typeof value === 'number') {
        return { key, match: { value } };
      }
      return { key, match: { value: String(value) } };
    }),
  };

  return { filters, qdrantFilter };
}

// Helper
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function trimContext(context, maxLength = 500) {
  if (!context) return '';

  // Option 1: Trim by character length
  if (context.length > maxLength) {
    return context.slice(0, maxLength) + '...';
  }

  // Option 2 (optional): Trim by number of JSON objects
  // let objects = context.split('\n').filter(Boolean);
  // return objects.slice(0, 3).join('\n'); // first 3 items

  return context;
}

function filterRelevantChunks(data, prompt) {
  return data.filter((item) =>
    JSON.stringify(item.payload).toLowerCase().includes(prompt.toLowerCase())
  );
}

module.exports = {
  formatEmployee,
  extractFiltersAndBuildQdrant,
  trimContext,
  filterRelevantChunks,
};