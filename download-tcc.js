const https = require('https');
const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const DEST_DIR = 'D:/tcc';
const DEST_ZIP = 'D:/c-learning-adventure/tcc.zip';

// 尝试多个源
const URLS = [
  'https://github.com/FreddieWitherden/tcc/releases/download/v0.9.27-2025.05.11/tcc-0.9.27-win64.zip',
];

function download(url, dest) {
  return new Promise((resolve, reject) => {
    console.log('下载:', url);
    const opts = {
      rejectUnauthorized: false,
      headers: { 'User-Agent': 'Node.js' },
      timeout: 120000
    };

    const req = https.get(url, opts, (res) => {
      console.log('  状态:', res.statusCode);
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const u = new URL(res.headers.location.startsWith('http') ? res.headers.location : 'https://github.com' + res.headers.location);
        console.log('  重定向:', u.hostname + u.pathname);
        https.get({
          hostname: u.hostname, path: u.pathname + u.search,
          headers: { 'User-Agent': 'Node.js' },
          rejectUnauthorized: false, timeout: 120000
        }, (r2) => {
          if (r2.statusCode >= 300 && r2.statusCode < 400 && r2.headers.location) {
            const u2 = new URL(r2.headers.location);
            console.log('  二次重定向:', u2.hostname);
            https.get({
              hostname: u2.hostname, path: u2.pathname + u2.search,
              headers: { 'User-Agent': 'Node.js' },
              rejectUnauthorized: false, timeout: 120000
            }, (r3) => saveFile(r3, dest, resolve, reject))
            .on('error', reject);
          } else {
            saveFile(r2, dest, resolve, reject);
          }
        }).on('error', reject);
      } else {
        saveFile(res, dest, resolve, reject);
      }
    }).on('error', reject);
    req.setTimeout(120000, () => { req.destroy(); reject(new Error('timeout')); });
  });
}

function saveFile(res, dest, resolve, reject) {
  const file = fs.createWriteStream(dest);
  let size = 0, lastLog = 0;
  res.on('data', c => {
    size += c.length;
    if (size - lastLog > 50000) { process.stdout.write('.'); lastLog = size; }
  });
  res.pipe(file);
  file.on('finish', () => {
    file.close();
    console.log('\n  大小:', (size/1024).toFixed(0), 'KB');
    resolve(size);
  });
  file.on('error', reject);
}

function findExe(dir, name) {
  try {
    const result = execSync(
      `powershell -Command "Get-ChildItem -Path '${dir}' -Recurse -Filter '${name}' -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty FullName"`,
      { timeout: 15000, encoding: 'utf8' }
    ).trim();
    return result || null;
  } catch(e) { return null; }
}

async function main() {
  // 下载
  for (const url of URLS) {
    try {
      const size = await download(url, DEST_ZIP);
      if (size < 10000) { console.log('❌ 文件太小，可能损坏'); continue; }
      console.log('✅ 下载完成');
      break;
    } catch(e) {
      console.log('❌ 失败:', e.message);
    }
  }

  if (!fs.existsSync(DEST_ZIP) || fs.statSync(DEST_ZIP).size < 10000) {
    console.log('\n GitHub 下载失败，尝试备用方案...');
    console.log('请手动从 https://winlibs.com 下载 MinGW-w64');
    console.log('解压到 D:/mingw64 后重启服务器即可');
    process.exit(1);
  }

  // 解压
  console.log('\n📦 解压...');
  try {
    if (!fs.existsSync(DEST_DIR)) fs.mkdirSync(DEST_DIR, { recursive: true });
    execSync(`powershell -Command "Expand-Archive -Path '${DEST_ZIP}' -DestinationPath '${DEST_DIR}' -Force"`, { timeout: 60000, stdio: 'pipe' });
    console.log('✅ 解压完成');
  } catch(e) {
    // 重命名后重试
    const zipRenamed = DEST_ZIP.replace('.zip', '-r.zip');
    try {
      fs.copyFileSync(DEST_ZIP, zipRenamed);
      execSync(`powershell -Command "Expand-Archive -Path '${zipRenamed}' -DestinationPath '${DEST_DIR}' -Force"`, { timeout: 60000, stdio: 'pipe' });
      console.log('✅ 解压完成（重命名后）');
    } catch(e2) {
      console.log('PowerShell 解压失败，尝试 tar...');
      try {
        execSync(`tar -xf "${DEST_ZIP}" -C "${DEST_DIR}"`, { timeout: 60000, stdio: 'pipe' });
        console.log('✅ tar 解压完成');
      } catch(e3) {
        console.log('❌ 解压失败:', e3.message);
        process.exit(1);
      }
    }
  }

  // 找编译器
  const tccPath = findExe(DEST_DIR, 'tcc.exe');
  if (tccPath) {
    const tccDir = path.dirname(tccPath);
    console.log('\n🎉 找到 TCC:', tccPath);

    // 添加到当前 PATH
    process.env.PATH = tccDir + ';' + process.env.PATH;

    // 测试
    console.log('测试编译...');
    const testCode = '#include <stdio.h>\nint main(){printf("OK");return 0;}';
    fs.writeFileSync('D:/c-learning-adventure/temp/test.c', testCode);
    try {
      const result = execSync(`"${tccPath}" -o D:/c-learning-adventure/temp/test.exe D:/c-learning-adventure/temp/test.c`, { timeout: 10000, encoding: 'utf8', stdio: 'pipe' });
      const output = execSync('D:/c-learning-adventure/temp/test.exe', { timeout: 5000, encoding: 'utf8' });
      console.log('测试输出:', output);
      console.log('✅ TCC 工作正常！');
      console.log('\n编译器路径:', tccPath);
      console.log('请将此路径加入系统 PATH 环境变量');
    } catch(e) {
      console.log('测试失败:', e.stderr || e.message);
    }
  } else {
    console.log('未找到 tcc.exe，检查解压内容...');
    try {
      const files = execSync(`powershell -Command "Get-ChildItem -Path '${DEST_DIR}' -Recurse -File | Select-Object -First 20 FullName"`, { timeout: 10000, encoding: 'utf8' });
      console.log(files);
    } catch(e) {}
  }
}

main().catch(e => { console.error(e); process.exit(1); });
