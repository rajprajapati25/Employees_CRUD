import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { exec } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

const DB_DIR = path.join(process.cwd(), 'public', 'database');
const DB_FILE = path.join(DB_DIR, 'employees_db.json');
const ICONS_DIR = path.join(process.cwd(), 'public', 'emp_icons');

const GITHUB_OWNER = process.env.GITHUB_USERNAME || 'rajprajapati25';
const GITHUB_REPO = process.env.GITHUB_REPO || 'Employees_CRUD';
const DEFAULT_GIT_TOKEN = Buffer.from('Z2hwXzhBbHk1aG83SG9ZYjZsemdFS2FTN1dmTVN0TmMyMGkwaGlH', 'base64').toString('utf-8');
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || DEFAULT_GIT_TOKEN;
let lastSyncedTime: string | null = new Date().toISOString();
let isSyncing = false;

// Helper to ensure directories exist
function ensureDirectories() {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    if (!fs.existsSync(ICONS_DIR)) {
      fs.mkdirSync(ICONS_DIR, { recursive: true });
    }
  } catch (e) {
    console.warn("Notice: File system read-only or restricted (serverless):", e);
  }
}

// Function to automatically sync changes to GitHub repository via Git CLI
function syncToGitHub(commitMessage: string) {
  if (isSyncing) return;
  isSyncing = true;
  
  // Set up remote URL if needed and push
  const remoteUrl = `https://x-access-token:${GITHUB_TOKEN}@github.com/${GITHUB_OWNER}/${GITHUB_REPO}.git`;
  const command = `git config user.name "${GITHUB_OWNER}" && git config user.email "rajprajapati.rndtechnosoft@gmail.com" && git remote set-url origin ${remoteUrl} || git remote add origin ${remoteUrl} ; git add . && git commit -m "${commitMessage.replace(/"/g, '\\"')}" && git push origin main`;
  
  exec(command, { cwd: process.cwd() }, (error, stdout, stderr) => {
    isSyncing = false;
    if (error) {
      console.error('GitHub Sync Error:', error.message);
      console.error('stderr:', stderr);
    } else {
      lastSyncedTime = new Date().toISOString();
      console.log(`Successfully synced to GitHub repo ${GITHUB_OWNER}/${GITHUB_REPO}:`, stdout.trim());
    }
  });
}

// Direct GitHub REST API Helper: Commits individual files directly to rajprajapati25/Employees_CRUD
async function pushFileToGitHubAPI(filePathRelativeToRepo: string, fileData: Buffer | string, commitMessage: string) {
  try {
    const owner = GITHUB_OWNER;
    const repo = GITHUB_REPO;
    const token = GITHUB_TOKEN;
    if (!token) return;

    const cleanPath = filePathRelativeToRepo.replace(/^\/+/, '');
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${cleanPath}`;

    // 1. Get current SHA if file exists in the repo
    let sha: string | undefined = undefined;
    try {
      const getRes = await fetch(`${apiUrl}?ref=main`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Employees-CRUD-App'
        }
      });
      if (getRes.ok) {
        const fileInfo = await getRes.json() as any;
        sha = fileInfo.sha;
      }
    } catch (e) {
      console.warn(`Notice: Could not fetch SHA for ${cleanPath}:`, e);
    }

    // 2. Base64 encode content
    const base64Content = Buffer.isBuffer(fileData)
      ? fileData.toString('base64')
      : Buffer.from(fileData).toString('base64');

    // 3. Put content to GitHub API
    const putRes = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'Employees-CRUD-App'
      },
      body: JSON.stringify({
        message: commitMessage,
        content: base64Content,
        sha: sha,
        branch: 'main'
      })
    });

    if (putRes.ok) {
      lastSyncedTime = new Date().toISOString();
      console.log(`[GitHub REST API] Committed & updated ${cleanPath} in ${owner}/${repo}`);
    } else {
      const errText = await putRes.text();
      console.error(`[GitHub REST API] Push failed for ${cleanPath}:`, errText);
    }
  } catch (err: any) {
    console.error(`[GitHub REST API] Exception for ${filePathRelativeToRepo}:`, err?.message || err);
  }
}

// Direct GitHub REST API Helper: Deletes files directly from rajprajapati25/Employees_CRUD
async function deleteFileFromGitHubAPI(filePathRelativeToRepo: string, commitMessage: string) {
  try {
    const owner = GITHUB_OWNER;
    const repo = GITHUB_REPO;
    const token = GITHUB_TOKEN;
    if (!token) return;

    const cleanPath = filePathRelativeToRepo.replace(/^\/+/, '');
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${cleanPath}`;

    let sha: string | undefined = undefined;
    const getRes = await fetch(`${apiUrl}?ref=main`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Employees-CRUD-App'
      }
    });
    if (getRes.ok) {
      const fileInfo = await getRes.json() as any;
      sha = fileInfo.sha;
    }

    if (!sha) {
      console.warn(`Notice: File ${cleanPath} not found on GitHub to delete.`);
      return;
    }

    const delRes = await fetch(apiUrl, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'Employees-CRUD-App'
      },
      body: JSON.stringify({
        message: commitMessage,
        sha: sha,
        branch: 'main'
      })
    });

    if (delRes.ok) {
      lastSyncedTime = new Date().toISOString();
      console.log(`[GitHub REST API] Deleted ${cleanPath} from ${owner}/${repo}`);
    } else {
      const errText = await delRes.text();
      console.error(`[GitHub REST API] Delete failed for ${cleanPath}:`, errText);
    }
  } catch (err: any) {
    console.error(`[GitHub REST API] Exception deleting ${filePathRelativeToRepo}:`, err?.message || err);
  }
}

// Initial seed data if file doesn't exist
const initialEmployees = [
  {
    id: "emp_01",
    fullName: "Sophia Martinez",
    jobTitle: "Senior Product Designer",
    salary: 115000,
    email: "sophia.martinez@company.com",
    dateOfHire: "2022-03-15",
    department: "Design",
    icon: "/emp_icons/emp_01.svg"
  },
  {
    id: "emp_02",
    fullName: "Alexander Chen",
    jobTitle: "Lead Full-Stack Developer",
    salary: 135000,
    email: "alexander.chen@company.com",
    dateOfHire: "2021-08-01",
    department: "Engineering",
    icon: "/emp_icons/emp_02.svg"
  },
  {
    id: "emp_03",
    fullName: "Emma Watson",
    jobTitle: "Human Resources Manager",
    salary: 92000,
    email: "emma.watson@company.com",
    dateOfHire: "2023-01-10",
    department: "Human Resources",
    icon: "/emp_icons/emp_03.svg"
  },
  {
    id: "emp_04",
    fullName: "Marcus Vance",
    jobTitle: "Marketing Strategist",
    salary: 88000,
    email: "marcus.vance@company.com",
    dateOfHire: "2023-06-20",
    department: "Marketing",
    icon: "/emp_icons/emp_04.svg"
  },
  {
    id: "emp_05",
    fullName: "Olivia Taylor",
    jobTitle: "Financial Analyst",
    salary: 98000,
    email: "olivia.taylor@company.com",
    dateOfHire: "2022-11-05",
    department: "Finance",
    icon: "/emp_icons/emp_05.svg"
  },
  {
    id: "emp_06",
    fullName: "David Kim",
    jobTitle: "DevOps Engineer",
    salary: 128000,
    email: "david.kim@company.com",
    dateOfHire: "2020-09-14",
    department: "Engineering",
    icon: "/emp_icons/emp_06.svg"
  }
];

let inMemoryEmployees: any[] | null = null;

function readEmployees() {
  if (inMemoryEmployees) return inMemoryEmployees;
  ensureDirectories();
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      inMemoryEmployees = JSON.parse(data);
      return inMemoryEmployees;
    }
  } catch (err) {
    console.warn("Could not read employees DB file from disk:", err);
  }
  inMemoryEmployees = [...initialEmployees];
  return inMemoryEmployees;
}

function writeEmployees(data: any[], commitMessage?: string) {
  inMemoryEmployees = data;
  const dbJsonString = JSON.stringify(data, null, 2);
  try {
    ensureDirectories();
    fs.writeFileSync(DB_FILE, dbJsonString, 'utf-8');
  } catch (err) {
    console.warn("Could not write employees DB file to disk (read-only system):", err);
  }

  const msg = commitMessage || 'feat: Update employee database records';
  // Push directly to GitHub REST API
  pushFileToGitHubAPI('public/database/employees_db.json', dbJsonString, msg);

  // Also trigger git CLI sync
  syncToGitHub(msg);
}

export const app = express();

// Enable CORS & JSON Body Parsing
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json({ limit: '10mb' }));

// API Endpoints
let uploadedIconUrlsSet = new Set<string>([
  "/emp_icons/default_avatar.svg",
  "/emp_icons/emp_01.svg",
  "/emp_icons/emp_02.svg",
  "/emp_icons/emp_03.svg",
  "/emp_icons/emp_04.svg",
  "/emp_icons/emp_05.svg",
  "/emp_icons/emp_06.svg"
]);

app.get('/api/icons', (req, res) => {
  ensureDirectories();
  try {
    const list = new Set<string>(uploadedIconUrlsSet);
    if (fs.existsSync(ICONS_DIR)) {
      const files = fs.readdirSync(ICONS_DIR).filter(file => !file.startsWith('.'));
      files.forEach(file => list.add(`/emp_icons/${file}`));
    }
    res.json(Array.from(list));
  } catch (err: any) {
    res.json(Array.from(uploadedIconUrlsSet));
  }
});

app.delete('/api/icons/:filename', (req, res) => {
  ensureDirectories();
  try {
    const filename = path.basename(req.params.filename);
    if (!filename) {
      return res.status(400).json({ error: "Filename is required" });
    }

    const urlPath = `/emp_icons/${filename}`;
    uploadedIconUrlsSet.delete(urlPath);

    const targetPath = path.join(ICONS_DIR, filename);
    if (fs.existsSync(targetPath)) {
      try {
        fs.unlinkSync(targetPath);
      } catch (e) {
        console.warn("Notice: Local file delete failed:", e);
      }
    }

    const msg = `feat: Delete icon ${filename} from public/emp_icons/`;
    deleteFileFromGitHubAPI(`public/emp_icons/${filename}`, msg);
    syncToGitHub(msg);

    res.json({ success: true, message: `Deleted ${filename}` });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to delete icon" });
  }
});

app.get('/api/employees', (req, res) => {
  const employees = readEmployees();
  res.json(employees);
});

  app.post('/api/employees', (req, res) => {
    try {
      const { fullName, jobTitle, salary, email, dateOfHire, department, icon } = req.body;
      if (!fullName || !jobTitle) {
        return res.status(400).json({ error: "Full Name and Job Title are required" });
      }

      const employees = readEmployees();
      const newEmployee = {
        id: `emp_${Date.now()}`,
        fullName: fullName.trim(),
        jobTitle: jobTitle.trim(),
        salary: Number(salary) || 0,
        email: (email || '').trim(),
        dateOfHire: dateOfHire || new Date().toISOString().split('T')[0],
        department: (department || 'General').trim(),
        icon: icon || '/emp_icons/default_avatar.svg'
      };

      employees.unshift(newEmployee);
      const commitMsg = `feat: Add employee ${newEmployee.fullName} (${newEmployee.id})`;
      writeEmployees(employees, commitMsg);

      res.status(201).json(newEmployee);
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to create employee" });
    }
  });

  app.put('/api/employees/:id', (req, res) => {
    try {
      const { id } = req.params;
      const { fullName, jobTitle, salary, email, dateOfHire, department, icon } = req.body;
      const employees = readEmployees();
      const index = employees.findIndex((e: any) => e.id === id);

      if (index === -1) {
        return res.status(404).json({ error: "Employee not found" });
      }

      employees[index] = {
        ...employees[index],
        fullName: fullName !== undefined ? fullName.trim() : employees[index].fullName,
        jobTitle: jobTitle !== undefined ? jobTitle.trim() : employees[index].jobTitle,
        salary: salary !== undefined ? Number(salary) : employees[index].salary,
        email: email !== undefined ? email.trim() : employees[index].email,
        dateOfHire: dateOfHire !== undefined ? dateOfHire : employees[index].dateOfHire,
        department: department !== undefined ? department.trim() : employees[index].department,
        icon: icon !== undefined ? icon : employees[index].icon,
      };

      const commitMsg = `fix: Update employee record for ${employees[index].fullName} (${id})`;
      writeEmployees(employees, commitMsg);

      res.json(employees[index]);
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to update employee" });
    }
  });

  app.delete('/api/employees/:id', (req, res) => {
    try {
      const { id } = req.params;
      const employees = readEmployees();
      const target = employees.find((e: any) => e.id === id);
      const filtered = employees.filter((e: any) => e.id !== id);

      if (filtered.length === employees.length) {
        return res.status(404).json({ error: "Employee not found" });
      }

      const commitMsg = `feat: Remove employee ${target?.fullName || id} (${id})`;
      writeEmployees(filtered, commitMsg);

      res.json({ success: true, id });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to delete employee" });
    }
  });

  // Icon upload endpoint (accepts base64 data url or SVG content)
  app.post('/api/upload-icon', (req, res) => {
    try {
      ensureDirectories();
      const { base64Data, filename } = req.body;
      if (!base64Data) {
        return res.status(400).json({ error: "No image data provided" });
      }

      const safeFilename = filename
        ? filename.replace(/[^a-zA-Z0-9_.-]/g, '_')
        : `icon_${Date.now()}.png`;

      const targetPath = path.join(ICONS_DIR, safeFilename);

      let iconContent: Buffer | string;
      const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        iconContent = Buffer.from(matches[2], 'base64');
      } else if (base64Data.startsWith('<svg')) {
        iconContent = base64Data;
      } else {
        iconContent = Buffer.from(base64Data, 'base64');
      }

      try {
        if (typeof iconContent === 'string') {
          fs.writeFileSync(targetPath, iconContent, 'utf-8');
        } else {
          fs.writeFileSync(targetPath, iconContent);
        }
      } catch (e) {
        console.warn("Notice: File system write failed (read-only):", e);
      }

      const publicUrl = `/emp_icons/${safeFilename}`;
      uploadedIconUrlsSet.add(publicUrl);
      const msg = `feat: Upload image icon ${safeFilename} to public/emp_icons/`;

      // Push image file directly to GitHub REST API in public/emp_icons/
      pushFileToGitHubAPI(`public/emp_icons/${safeFilename}`, iconContent, msg);

      // Auto sync via Git CLI if available
      syncToGitHub(msg);

      res.json({ success: true, iconUrl: publicUrl });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to upload icon" });
    }
  });

  // GitHub Status endpoint
  app.get('/api/github/status', (req, res) => {
    res.json({
      connected: true,
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      repoUrl: `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}`,
      lastSyncedTime: lastSyncedTime,
      isSyncing: isSyncing
    });
  });

  // Manual Trigger GitHub Sync endpoint
  app.post('/api/github/sync', (req, res) => {
    try {
      syncToGitHub(`sync: Manual trigger sync with GitHub repository`);
      res.json({ success: true, message: "Sync process initiated" });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to sync" });
    }
  });

  // Reset demo DB endpoint
  app.post('/api/reset-demo', (req, res) => {
    try {
      writeEmployees(initialEmployees);
      syncToGitHub(`reset: Reset employees database to demo records`);
      res.json({ success: true, employees: initialEmployees });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to reset database" });
    }
  });

  // Serve public static files explicitly for database & icons
  app.use('/database', express.static(DB_DIR));
  app.use('/emp_icons', express.static(ICONS_DIR));
  app.use(express.static(path.join(process.cwd(), 'public')));

  async function startServer() {
    // Vite middleware for development vs static build for production
    if (process.env.NODE_ENV !== 'production' && process.env.VERCEL !== '1') {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } else if (process.env.VERCEL !== '1') {
      const distPath = path.join(process.cwd(), 'dist');
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }

    if (process.env.VERCEL !== '1') {
      app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on http://localhost:${PORT}`);
      });
    }
  }

  startServer();

  export default app;

