const express = require('express');
const { execFile, execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { CSimulator } = require('./c-simulator');

const simulator = new CSimulator();

const PORT = 4567;
const TEMP_DIR = path.join(__dirname, 'temp');
const LEVELS_FILE = path.join(__dirname, 'levels', 'levels.json');
const PROGRESS_FILE = path.join(__dirname, 'progress.json');

[TEMP_DIR].forEach(d => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); });

// ============ 编译器检测 ============
let COMPILER = null; // { type: 'gcc'|'msvc', path: string, vcvars?: string }

function findCompiler() {
  // 1. 优先 GCC
  const gccDirs = [
    'gcc',
    'D:\\Git\\mingw64\\bin\\gcc.exe',
    'C:\\mingw64\\bin\\gcc.exe',
    'C:\\msys64\\mingw64\\bin\\gcc.exe',
    'C:\\msys64\\ucrt64\\bin\\gcc.exe',
    'D:\\mingw64\\bin\\gcc.exe',
  ];
  // 搜索 winget 安装
  try {
    const wingetBase = path.join(process.env.LOCALAPPDATA || '', 'Microsoft', 'WinGet', 'Packages');
    if (fs.existsSync(wingetBase)) {
      for (const d of fs.readdirSync(wingetBase)) {
        if (d.toLowerCase().includes('winlibs') || d.toLowerCase().includes('mingw')) {
          const searchDir = path.join(wingetBase, d);
          try {
            for (const sd of fs.readdirSync(searchDir)) {
              const p = path.join(searchDir, sd, 'bin', 'gcc.exe');
              if (fs.existsSync(p)) gccDirs.push(p);
            }
          } catch(e) {}
        }
      }
    }
  } catch(e) {}
  // 搜索 Program Files
  try {
    const pf = 'C:\\Program Files\\WinLibs';
    if (fs.existsSync(pf)) {
      for (const d of fs.readdirSync(pf)) {
        const p = path.join(pf, d, 'bin', 'gcc.exe');
        if (fs.existsSync(p)) gccDirs.push(p);
      }
    }
  } catch(e) {}

  for (const c of gccDirs) {
    if (fs.existsSync(c)) {
      try { execSync(`"${c}" --version`, { timeout: 5000, stdio: 'pipe' }); return { type: 'gcc', path: c }; }
      catch(e) {}
    }
  }

  // 2. 尝试 MSVC
  const clPath = 'D:\\vs\\VC\\Tools\\MSVC\\14.51.36231\\bin\\Hostx64\\x64\\cl.exe';
  const vcvarsPath = 'D:\\vs\\VC\\Auxiliary\\Build\\vcvars64.bat';
  if (fs.existsSync(clPath) && fs.existsSync(vcvarsPath)) {
    return { type: 'msvc', path: clPath, vcvars: vcvarsPath };
  }

  // 3. 搜索其他 MSVC 版本
  try {
    const vsBase = 'D:\\vs\\VC\\Tools\\MSVC';
    if (fs.existsSync(vsBase)) {
      for (const ver of fs.readdirSync(vsBase)) {
        const cl = path.join(vsBase, ver, 'bin', 'Hostx64', 'x64', 'cl.exe');
        if (fs.existsSync(cl)) return { type: 'msvc', path: cl, vcvars: vcvarsPath };
      }
    }
  } catch(e) {}

  return null;
}

COMPILER = findCompiler();
// ============ 编译运行（优先 gcc，后备模拟器）============
function compileAndRun(code, testInput = '') {
  // 安全检查
  const dangerous = [/system\s*\(/, /exec\s*\(/, /fork\s*\(/, /popen\s*\(/,
    /#include\s*<unistd\.h>/, /socket\s*\(/, /connect\s*\(/, /remove\s*\(/];
  for (const p of dangerous) {
    if (p.test(code)) {
      return Promise.resolve({ success: false, error: '⚠️ 代码包含不安全内容', phase: 'security' });
    }
  }

  // 有编译器，使用真实编译
  if (COMPILER) {
    return compileWithCompiler(code, testInput);
  }

  // 后备：使用 JavaScript 模拟器
  return Promise.resolve(simulator.run(code, testInput));
}
// ============ 真实编译器编译运行 ============
async function compileWithCompiler(code, testInput = '') {
  if (COMPILER.type === 'msvc') return compileWithMSVC(code, testInput);
  return compileWithGCC(code, testInput);
}

async function compileWithMSVC(code, testInput = '') {
  const id = crypto.randomBytes(4).toString('hex');
  const srcFile = path.join(TEMP_DIR, `prog_${id}.c`);
  const exeFile = path.join(TEMP_DIR, `prog_${id}.exe`);
  const batchFile = path.join(TEMP_DIR, `build_${id}.bat`);
  const inputFile = path.join(TEMP_DIR, `input_${id}.txt`);

  return new Promise((resolve) => {
    try {
      fs.writeFileSync(srcFile, code, 'utf8');
      if (testInput) fs.writeFileSync(inputFile, testInput, 'utf8');

      // 写批处理文件
      const batch = `@echo off\r\nchcp 65001 >nul\r\ncall "${COMPILER.vcvars}" >nul 2>&1\r\n"${COMPILER.path}" /nologo /utf-8 /W0 /O2 "${srcFile}" /Fe:"${exeFile}" /link 2>&1\r\n`;
      fs.writeFileSync(batchFile, batch, 'utf8');

      execFile('cmd.exe', ['/c', batchFile], { timeout: 15000 }, (err, stdout, stderr) => {
        if (err || (stderr && stderr.includes('error'))) {
          const error = (stderr || stdout || err?.message || 'compile error').slice(0, 2000)
            .replaceAll(srcFile, 'prog.c');
          cleanup([srcFile, exeFile, inputFile, batchFile, exeFile + '.obj']);
          return resolve({ success: false, error, phase: 'compile' });
        }

        if (!fs.existsSync(exeFile)) {
          cleanup([srcFile, exeFile, inputFile, batchFile, exeFile + '.obj']);
          return resolve({ success: false, error: (stdout || '编译失败').slice(0, 2000), phase: 'compile' });
        }

        // 运行
        runExe(id, exeFile, testInput, inputFile, [srcFile, exeFile, inputFile, batchFile, exeFile + '.obj']).then(resolve);
      });
    } catch(e) {
      cleanup([srcFile, exeFile, inputFile, batchFile]);
      resolve({ success: false, error: e.message, phase: 'system' });
    }
  });
}

function runExe(id, exeFile, testInput, inputFile, cleanupFiles) {
  return new Promise((resolve) => {
    let inputFd = null;
    if (testInput && fs.existsSync(inputFile)) {
      inputFd = fs.openSync(inputFile, 'r');
    }

    execFile(exeFile, [], {
      timeout: 5000, maxBuffer: 1024 * 100,
      stdio: inputFd ? [inputFd, 'pipe', 'pipe'] : 'pipe',
    }, (runErr, stdout, stderr) => {
      if (inputFd) try { fs.closeSync(inputFd); } catch(e) {}
      cleanup(cleanupFiles);

      if (runErr) {
        const error = runErr.killed ? '⏰ 超时（>5秒）' : (stderr || runErr.message || '').slice(0, 2000);
        return resolve({ success: false, error, output: (stdout||'').slice(0, 5000), phase: 'run' });
      }
      resolve({ success: true, output: (stdout||'').replace(/\r\n/g,'\n').trim() });
    });
  });
}

function compileWithGCC(code, testInput = '') {
  const id = crypto.randomBytes(4).toString('hex');
  const srcFile = path.join(TEMP_DIR, `prog_${id}.c`);
  const exeFile = path.join(TEMP_DIR, `prog_${id}.exe`);
  const inputFile = path.join(TEMP_DIR, `input_${id}.txt`);

  return new Promise((resolve) => {
    try {
      fs.writeFileSync(srcFile, code, 'utf8');
      if (testInput) fs.writeFileSync(inputFile, testInput, 'utf8');

      const gcc = COMPILER.path;

      execFile(gcc, ['-Wall', '-o', exeFile, srcFile], { timeout: 10000 },
        (compileErr, _stdout, stderr) => {
          if (compileErr) {
            const error = (stderr || compileErr.message || 'Unknown error')
              .replaceAll(srcFile, 'prog.c')
              .replaceAll(TEMP_DIR, '')
              .slice(0, 2000);
            cleanup([srcFile, exeFile, inputFile]);
            return resolve({ success: false, error, phase: 'compile' });
          }

          let inputFd = null;
          if (testInput && fs.existsSync(inputFile)) {
            inputFd = fs.openSync(inputFile, 'r');
          }

          const child = execFile(exeFile, [], {
            timeout: 5000,
            maxBuffer: 1024 * 100,
            stdio: inputFd ? [inputFd, 'pipe', 'pipe'] : 'pipe',
          }, (runErr, stdout, stderr) => {
            if (inputFd) try { fs.closeSync(inputFd); } catch (e) { /* ignore */ }
            cleanup([srcFile, exeFile, inputFile]);

            if (runErr) {
              const error = runErr.killed
                ? '⏰ 程序超时（>5秒）- 可能有死循环'
                : (stderr || runErr.message || 'Runtime error').slice(0, 2000);
              return resolve({ success: false, error, output: (stdout||'').slice(0,5000), phase: 'run' });
            }
            resolve({ success: true, output: (stdout||'').replace(/\r\n/g,'\n').trim(), raw: (stdout||'').slice(0,5000) });
          });

          setTimeout(() => {
            if (child.exitCode === null) {
              child.kill('SIGTERM');
              setTimeout(() => { if (child.exitCode === null) child.kill('SIGKILL'); }, 1000);
            }
          }, 5000);
        });
    } catch (e) {
      cleanup([srcFile, exeFile, inputFile]);
      resolve({ success: false, error: '系统错误: ' + e.message, phase: 'system' });
    }
  });
}

function cleanup(files) {
  for (const f of files) {
    try { if (f && fs.existsSync(f)) fs.unlinkSync(f); } catch (e) { /* ignore */ }
  }
}

// ============ 进度 ============
function loadProgress() {
  try {
    if (fs.existsSync(PROGRESS_FILE)) return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
  } catch (e) { /* ignore */ }
  return { completed: {}, xp: 0 };
}

function saveProgress(progress) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

// ============ Express ============
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API: 编译器状态
app.get('/api/compiler-status', (_req, res) => {
  COMPILER = findCompiler();
  res.json({
    available: !!COMPILER,
    path: COMPILER || '未找到',
    installHint: COMPILER ? null : '请运行 install-gcc.bat 安装编译器，或手动安装 MinGW-w64 / TCC'
  });
});

// API: 关卡列表
app.get('/api/levels', (_req, res) => {
  try {
    const levels = JSON.parse(fs.readFileSync(LEVELS_FILE, 'utf8'));
    const progress = loadProgress();
    res.json({
      levels: levels.map(l => ({
        id: l.id, title: l.title, chapter: l.chapter, xp: l.xp,
        completed: !!progress.completed[l.id],
        extraCompleted: !!progress.completed[`${l.id}_extra`]
      })),
      progress
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// API: 关卡详情
app.get('/api/levels/:id', (req, res) => {
  try {
    const levels = JSON.parse(fs.readFileSync(LEVELS_FILE, 'utf8'));
    const level = levels.find(l => l.id === parseInt(req.params.id));
    if (!level) return res.status(404).json({ error: '关卡不存在' });
    const progress = loadProgress();
    res.json({
      ...level,
      completed: !!progress.completed[level.id],
      extraCompleted: !!progress.completed[`${level.id}_extra`]
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// API: 运行代码
app.post('/api/run', async (req, res) => {
  const { code } = req.body;
  if (!code || code.length > 10000) {
    return res.status(400).json({ error: '代码不能为空或超过10000字符' });
  }

  // 安全检查
  const dangerous = [/system\s*\(/, /exec\s*\(/, /fork\s*\(/, /popen\s*\(/,
    /#include\s*<unistd\.h>/, /socket\s*\(/, /connect\s*\(/, /remove\s*\(/];
  for (const p of dangerous) {
    if (p.test(code)) {
      return res.json({ success: false, error: '⚠️ 代码包含不安全内容', phase: 'security' });
    }
  }

  if (!COMPILER) {
    return res.json({ success: false, error: '🔧 未找到 C 编译器', phase: 'compiler' });
  }

  const result = await compileAndRun(code, '');
  res.json(result);
});

// API: 提交挑战
app.post('/api/submit', async (req, res) => {
  const { levelId, code, isExtra } = req.body;
  try {
    const levels = JSON.parse(fs.readFileSync(LEVELS_FILE, 'utf8'));
    const level = levels.find(l => l.id === parseInt(levelId));
    if (!level) return res.status(404).json({ error: '关卡不存在' });

    if (!COMPILER) {
      return res.json({ passed: false, message: '🔧 未找到 C 编译器。请先安装。' });
    }

    const challenge = isExtra ? level.extraChallenge : level;
    if (!challenge?.expectedOutput) {
      return res.json({ passed: false, message: '无效的挑战' });
    }

    const result = await compileAndRun(code, level.testInput || '');

    if (!result.success) {
      return res.json({ passed: false, message: result.error, phase: result.phase });
    }

    const expected = challenge.expectedOutput.replace(/\r\n/g, '\n').trim();
    const actual = (result.output || '').replace(/\r\n/g, '\n').trim();
    const matchType = level.matchType || 'contains';

    let passed = false;
    if (matchType === 'exact') {
      passed = actual === expected;
    } else if (matchType === 'contains') {
      passed = expected.split('\n').filter(Boolean).every(line => actual.includes(line.trim()));
    } else if (matchType === 'regex') {
      try { passed = new RegExp(expected).test(actual); } catch (e) { passed = actual.includes(expected); }
    }

    if (passed) {
      const progress = loadProgress();
      const key = isExtra ? `${level.id}_extra` : `${level.id}`;
      if (!progress.completed[key]) {
        progress.completed[key] = new Date().toISOString();
        progress.xp = (progress.xp || 0) + level.xp;
        saveProgress(progress);
      }
      res.json({
        passed: true,
        message: isExtra ? `🎉 额外挑战完成！+${level.xp} XP` : `✅ 挑战成功！+${level.xp} XP`,
        output: result.output, xp: level.xp, totalXp: progress.xp
      });
    } else {
      res.json({
        passed: false, message: '输出不匹配，请再试一次',
        expected: expected.slice(0, 300), actual: actual.slice(0, 300)
      });
    }
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ============ 启动 ============
app.listen(PORT, '127.0.0.1', () => {
  COMPILER = findCompiler();
  console.log('');
  console.log('  🎓 C语言闯关学习平台');
  console.log(`  📡 http://127.0.0.1:${PORT}`);
  const compilerInfo = COMPILER ? `${COMPILER.type.toUpperCase()} (${COMPILER.path})` : '❌ 未找到';
  console.log(`  🔧 编译器: ${compilerInfo}`);
  console.log(`  📚 关卡: ${JSON.parse(fs.readFileSync(LEVELS_FILE,'utf8')).length} 关`);
  console.log('');
});
