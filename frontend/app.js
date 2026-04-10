// ===== STATE =====
let students = [], companies = [], jobPostings = [], applications = [], interviews = [];
const API_BASE = '/api';

// ===== API HELPERS =====
async function fetchData(endpoint) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    console.error('Fetch error', endpoint, e);
    return [];
  }
}

async function postData(endpoint, data) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    console.error('Post error', endpoint, e);
    alert('Failed to save. Check console.');
    return null;
  }
}

async function deleteData(endpoint) {
  if (!confirm('Delete this record?')) return;
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    await loadAllData();
  } catch (e) {
    console.error('Delete error', endpoint, e);
    alert('Failed to delete. Check console.');
  }
}

// ===== LOAD ALL =====
async function loadAllData() {
  const [s, c, j, a, i] = await Promise.all([
    fetchData('/students'),
    fetchData('/companies'),
    fetchData('/jobs'),
    fetchData('/applications'),
    fetchData('/interviews')
  ]);
  students    = s || [];
  companies   = c || [];
  jobPostings = j || [];
  applications = a || [];
  interviews  = i || [];

  renderDashboard();
  renderStudents();
  renderCompanies();
  renderJobs();
  renderApplicationsAndInterviews();
  populateDropdowns();
}

// ===== MAIN NAV (outer tabs: sections 1-11) =====
function setupMainNav() {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.sec-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const target = btn.dataset.section;
      document.getElementById(target).classList.add('active');
    });
  });
}

// ===== INNER NAV (Project Demo sub-tabs) =====
function setupInnerNav() {
  document.querySelectorAll('.ib').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.ib').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.ipanel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const target = btn.dataset.itab;
      document.getElementById(target).classList.add('active');
    });
  });
}

// ===== DASHBOARD =====
function renderDashboard() {
  document.getElementById('total-students').textContent    = students.length;
  document.getElementById('total-companies').textContent   = companies.length;
  document.getElementById('total-jobs').textContent        = jobPostings.length;
  document.getElementById('total-applications').textContent = applications.length;

  const avgCgpa = students.length
    ? (students.reduce((s, x) => s + Number(x.cgpa || 0), 0) / students.length).toFixed(2)
    : '0.00';
  const maxPkg = jobPostings.length
    ? Math.max(...jobPostings.map(j => Number(j.package_lpa || 0))).toFixed(2)
    : '0.00';
  document.getElementById('avg-cgpa').textContent    = avgCgpa;
  document.getElementById('max-package').textContent = maxPkg;
}

// ===== STUDENTS =====
function renderStudents() {
  const tbody = document.getElementById('students-tbody');
  const search = document.getElementById('student-search');

  function render() {
    const term = search.value.toLowerCase();
    tbody.innerHTML = '';
    students
      .filter(s => !term || [s.name, s.branch, s.skills].join(' ').toLowerCase().includes(term))
      .forEach(s => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${s.student_id}</td>
          <td><strong>${s.name}</strong></td>
          <td>${s.email}</td>
          <td>${s.branch}</td>
          <td>${s.cgpa}</td>
          <td>${s.graduation_year}</td>
          <td>${s.skills || '—'}</td>
          <td>${s.resume_link ? `<a href="${s.resume_link}" target="_blank" class="resume-link">View</a>` : '—'}</td>
          <td><button class="button-link" style="color:#ef4444" onclick="deleteData('/students/${s.student_id}')">Delete</button></td>`;
        tbody.appendChild(tr);
      });
  }

  search.removeEventListener('input', render);
  search.addEventListener('input', render);
  render();
}

// ===== COMPANIES =====
function renderCompanies() {
  const tbody = document.getElementById('companies-tbody');
  const search = document.getElementById('company-search');

  function render() {
    const term = search.value.toLowerCase();
    tbody.innerHTML = '';
    companies
      .filter(c => !term || [c.company_name, c.industry, c.location].join(' ').toLowerCase().includes(term))
      .forEach(c => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${c.company_id}</td>
          <td><strong>${c.company_name}</strong></td>
          <td>${c.industry || '—'}</td>
          <td>${c.location || '—'}</td>
          <td>${c.hr_email || '—'}</td>
          <td><button class="button-link" style="color:#ef4444" onclick="deleteData('/companies/${c.company_id}')">Delete</button></td>`;
        tbody.appendChild(tr);
      });
  }

  search.removeEventListener('input', render);
  search.addEventListener('input', render);
  render();
}

// ===== JOBS =====
function renderJobs() {
  const tbody     = document.getElementById('jobs-tbody');
  const eligible  = document.getElementById('eligible-students-tbody');
  const filter    = document.getElementById('job-company-filter');
  const prev      = filter.value;

  filter.innerHTML = '<option value="">All Companies</option>';
  companies.forEach(c => {
    filter.innerHTML += `<option value="${c.company_id}">${c.company_name}</option>`;
  });
  filter.value = prev;

  function showEligible(job) {
    eligible.innerHTML = '';
    if (!job) return;
    students
      .filter(s => Number(s.cgpa) >= Number(job.min_cgpa))
      .forEach(s => {
        eligible.innerHTML += `<tr><td><strong>${s.name}</strong></td><td>${s.branch}</td><td>${s.cgpa}</td></tr>`;
      });
  }

  function render() {
    const cid = filter.value;
    tbody.innerHTML = '';
    jobPostings
      .filter(j => !cid || String(j.company_id) === cid)
      .forEach(j => {
        const co = j.company_name || (companies.find(c => c.company_id === j.company_id)?.company_name) || '—';
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${j.job_id}</td>
          <td>${co}</td>
          <td><strong>${j.role}</strong></td>
          <td>${j.package_lpa} LPA</td>
          <td>${j.min_cgpa}</td>
          <td><span class="pill status-applied">${j.job_type}</span></td>
          <td><button class="button-link view-btn" data-jid="${j.job_id}">View</button></td>
          <td><button class="button-link" style="color:#ef4444" onclick="deleteData('/jobs/${j.job_id}')">Delete</button></td>`;
        tbody.appendChild(tr);
      });
    tbody.querySelectorAll('.view-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const job = jobPostings.find(j => j.job_id === Number(btn.dataset.jid));
        showEligible(job);
      });
    });
  }

  filter.removeEventListener('change', render);
  filter.addEventListener('change', render);
  render();
}

// ===== APPLICATIONS & INTERVIEWS =====
function statusClass(status='') {
  const m = { applied:'status-applied', shortlisted:'status-shortlisted', interviewed:'status-interviewed', offered:'status-offered', rejected:'status-rejected' };
  return m[status.toLowerCase()] || 'status-applied';
}

function renderApplicationsAndInterviews() {
  const aTbody  = document.getElementById('applications-tbody');
  const iTbody  = document.getElementById('interviews-tbody');
  const stuFilt = document.getElementById('application-student-filter');
  const stsFilt = document.getElementById('application-status-filter');
  const prev    = stuFilt.value;

  stuFilt.innerHTML = '<option value="">Filter by Student</option>';
  students.forEach(s => {
    stuFilt.innerHTML += `<option value="${s.student_id}">${s.name}</option>`;
  });
  stuFilt.value = prev;

  function renderApps() {
    const sid = stuFilt.value, sts = stsFilt.value;
    aTbody.innerHTML = '';
    applications
      .filter(a => (!sid || String(a.student_id) === sid) && (!sts || a.status === sts))
      .forEach(a => {
        aTbody.innerHTML += `<tr>
          <td>${a.application_id}</td>
          <td><strong>${a.student_name || '—'}</strong></td>
          <td>${a.company_name || '—'}</td>
          <td>${a.role || '—'}</td>
          <td><span class="pill ${statusClass(a.status)}">${a.status}</span></td>
          <td>${a.applied_date ? a.applied_date.substring(0, 10) : '—'}</td>
          <td><button class="button-link" style="color:#ef4444" onclick="deleteData('/applications/${a.application_id}')">Delete</button></td>
        </tr>`;
      });
  }

  function renderInterviews() {
    iTbody.innerHTML = '';
    interviews.forEach(iv => {
      iTbody.innerHTML += `<tr>
        <td><strong>${iv.student_name || '—'}</strong></td>
        <td>${iv.company_name || '—'}</td>
        <td>${iv.role || '—'}</td>
        <td>${iv.interview_date ? iv.interview_date.substring(0, 10) : '—'}</td>
        <td>${iv.interview_mode || '—'}</td>
        <td><span class="pill ${iv.result === 'Selected' ? 'status-offered' : 'status-rejected'}">${iv.result || '—'}</span></td>
      </tr>`;
    });
  }

  stuFilt.removeEventListener('change', renderApps);
  stsFilt.removeEventListener('change', renderApps);
  stuFilt.addEventListener('change', renderApps);
  stsFilt.addEventListener('change', renderApps);
  renderApps();
  renderInterviews();
}

// ===== DROPDOWNS =====
function populateDropdowns() {
  const jComp = document.getElementById('job-company-id');
  const aStu  = document.getElementById('app-student-id');
  const aJob  = document.getElementById('app-job-id');

  jComp.innerHTML = '<option value="">Select Company</option>';
  companies.forEach(c => { jComp.innerHTML += `<option value="${c.company_id}">${c.company_name}</option>`; });

  aStu.innerHTML = '<option value="">Select Student</option>';
  students.forEach(s => { aStu.innerHTML += `<option value="${s.student_id}">${s.name}</option>`; });

  aJob.innerHTML = '<option value="">Select Job</option>';
  jobPostings.forEach(j => {
    const co = companies.find(c => c.company_id === j.company_id)?.company_name || '?';
    aJob.innerHTML += `<option value="${j.job_id}">${j.role} (${co})</option>`;
  });
}

// ===== FORMS =====
function setupForms() {
  // Add Student
  document.getElementById('add-student-form').addEventListener('submit', async e => {
    e.preventDefault();
    const data = {
      name: document.getElementById('student-name').value,
      email: document.getElementById('student-email').value,
      branch: document.getElementById('student-branch').value,
      cgpa: parseFloat(document.getElementById('student-cgpa').value),
      graduation_year: parseInt(document.getElementById('student-year').value),
      skills: document.getElementById('student-skills').value,
      resume_link: document.getElementById('student-resume').value
    };
    const r = await postData('/students', data);
    if (r) { e.target.reset(); await loadAllData(); }
  });

  // Add Company
  document.getElementById('add-company-form').addEventListener('submit', async e => {
    e.preventDefault();
    const data = {
      company_name: document.getElementById('company-name').value,
      industry: document.getElementById('company-industry').value,
      location: document.getElementById('company-location').value,
      hr_email: document.getElementById('company-hr-email').value
    };
    const r = await postData('/companies', data);
    if (r) { e.target.reset(); await loadAllData(); }
  });

  // Add Job
  document.getElementById('add-job-form').addEventListener('submit', async e => {
    e.preventDefault();
    const data = {
      company_id: parseInt(document.getElementById('job-company-id').value),
      role: document.getElementById('job-role').value,
      package_lpa: parseFloat(document.getElementById('job-package').value),
      min_cgpa: parseFloat(document.getElementById('job-min-cgpa').value),
      job_type: document.getElementById('job-type').value
    };
    const r = await postData('/jobs', data);
    if (r) { e.target.reset(); await loadAllData(); }
  });

  // Add Application
  document.getElementById('add-application-form').addEventListener('submit', async e => {
    e.preventDefault();
    const data = {
      student_id: parseInt(document.getElementById('app-student-id').value),
      job_id: parseInt(document.getElementById('app-job-id').value),
      status: document.getElementById('app-status').value,
      applied_date: document.getElementById('app-date').value
    };
    const r = await postData('/applications', data);
    if (r) { e.target.reset(); await loadAllData(); }
  });
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  // Render Lucide SVG icons
  if (typeof lucide !== 'undefined') lucide.createIcons();
  setupMainNav();
  setupInnerNav();
  setupForms();
  loadAllData();
});
