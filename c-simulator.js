/**
 * 轻量级 C 程序模拟执行器
 *
 * 专门为 C 语言学习关卡设计的受限运行时。
 * 支持: printf, scanf, 基本类型, if/else, for/while, 数组, 函数, 指针, 结构体
 *
 * 这不是完整的 C 编译器——只覆盖闯关教学需要的语法。
 * 当系统没有 gcc 时作为后备方案。
 */

class CSimulator {
  constructor() {
    this.variables = {};       // 变量存储
    this.arrays = {};          // 数组存储
    this.output = '';          // 捕获 printf 输出
    this.inputQueue = [];      // scanf 输入队列
    this.inputIndex = 0;
    this.functions = {};       // 自定义函数
    this.structs = {};         // 结构体定义
    this.pc = 0;               // 程序计数器
    this.scope = [{}];         // 作用域栈
  }

  reset() {
    this.variables = {};
    this.arrays = {};
    this.output = '';
    this.inputQueue = [];
    this.inputIndex = 0;
    this.functions = {};
    this.structs = {};
    this.pc = 0;
    this.scope = [{}];
  }

  // ============ 主入口 ============
  run(code, testInput = '') {
    this.reset();
    if (testInput) {
      // 解析模拟输入（空格/换行分隔）
      this.inputQueue = testInput.trim().split(/[\s\n]+/).filter(Boolean);
    }

    try {
      // 预处理和解析
      const normalized = this.preprocess(code);
      this.execute(normalized);
      return { success: true, output: this.output.trim() };
    } catch (e) {
      return { success: false, error: e.message || '执行错误', phase: 'runtime' };
    }
  }

  // ============ 预处理 ============
  preprocess(code) {
    // 去除 #include（我们的模拟器不需要）
    // 提取函数定义
    let processed = code;

    // 移除注释
    processed = processed.replace(/\/\*[\s\S]*?\*\//g, '');
    processed = processed.replace(/\/\/.*$/gm, '');

    // 移除 #include 行
    processed = processed.replace(/#include\s*<[^>]+>/g, '');
    processed = processed.replace(/#include\s*"[^"]+"/g, '');

    return processed;
  }

  // ============ 执行引擎 ============
  execute(code) {
    // 提取所有函数定义
    const funcPattern = /(\w+(?:\s*\*)?)\s+(\w+)\s*\(([^)]*)\)\s*\{/g;
    let match;
    const funcDefs = [];

    while ((match = funcPattern.exec(code)) !== null) {
      const returnType = match[1].trim();
      const name = match[2].trim();
      const params = match[3].trim();
      const startIdx = match.index + match[0].length;

      if (name !== 'main') {
        // 找到函数结束
        const endIdx = this.findMatchingBrace(code, startIdx - 1);
        const body = code.slice(startIdx, endIdx);
        this.functions[name] = { returnType, params: params.split(',').map(p => p.trim()).filter(Boolean), body };

        // 从代码中移除函数定义
        code = code.slice(0, match.index) + code.slice(endIdx + 1);
        funcPattern.lastIndex = 0;
      }
    }

    // 找到并执行 main 函数
    const mainMatch = /int\s+main\s*\(\s*(?:void)?\s*\)\s*\{/.exec(code);
    if (!mainMatch) {
      throw new Error('未找到 main 函数');
    }

    const mainStart = mainMatch.index + mainMatch[0].length;
    const mainEnd = this.findMatchingBrace(code, mainStart - 1);
    const mainBody = code.slice(mainStart, mainEnd);

    this.executeBlock(mainBody);
  }

  findMatchingBrace(code, openIdx) {
    let depth = 0;
    for (let i = openIdx; i < code.length; i++) {
      if (code[i] === '{') depth++;
      else if (code[i] === '}') {
        depth--;
        if (depth === 0) return i;
      }
    }
    return code.length;
  }

  // ============ 语句执行 ============
  executeBlock(block) {
    const statements = this.splitStatements(block);
    let i = 0;

    while (i < statements.length) {
      const stmt = statements[i].trim();
      if (!stmt || stmt === ';') { i++; continue; }

      const result = this.executeStatement(stmt, statements, i);
      if (result === 'break') break;
      if (result === 'continue') { /* continue */ }
      if (result && result.skipTo !== undefined) { i = result.skipTo; continue; }
      if (result && result.returnValue !== undefined) return result;
      i++;
    }
  }

  splitStatements(block) {
    const stmts = [];
    let current = '';
    let depth = 0;
    let inString = false;
    let inChar = false;
    let inForHead = 0;  // for 头部深度

    for (let i = 0; i < block.length; i++) {
      const ch = block[i];

      if (ch === '"' && !inChar) { inString = !inString; current += ch; continue; }
      if (ch === "'" && !inString) { inChar = !inChar; current += ch; continue; }
      if (inString || inChar) { current += ch; continue; }

      if (ch === '{' || ch === '(') {
        depth++;
        // 检测是否进入 for 头部的 (
        if (ch === '(' && /for\s*$/.test(current.trim())) {
          inForHead = depth;
        }
      } else if (ch === '}') {
        depth--;
        if (inForHead > 0 && depth < inForHead) inForHead = 0;
      } else if (ch === ')') {
        depth--;
        if (inForHead > 0 && depth < inForHead) inForHead = 0;
      }

      if (ch === ';' && depth === 0 && inForHead === 0) {
        stmts.push(current + ';');
        current = '';
      } else {
        current += ch;
      }
    }
    if (current.trim()) stmts.push(current.trim());
    return stmts;
  }

  executeStatement(stmt, allStatements, currentIndex) {
    stmt = stmt.trim();
    if (!stmt || stmt === ';') return null;

    // ===== 复合语句（if/for/while等） =====

    // if 语句（支持 if 和 if(）
    if (/^if[\s(]/.test(stmt)) {
      return this.execIf(stmt, allStatements, currentIndex);
    }

    // for 循环
    if (/^for[\s(]/.test(stmt)) {
      return this.execFor(stmt);
    }

    // while 循环
    if (/^while[\s(]/.test(stmt)) {
      return this.execWhile(stmt);
    }

    // do-while (作为特例，用正则匹配)
    if (/^do\s*\{/.test(stmt)) {
      return this.execDoWhile(stmt);
    }

    // break / continue
    if (stmt === 'break;') return 'break';
    if (stmt === 'continue;') return 'continue';

    // return 语句
    if (stmt.startsWith('return ')) {
      const expr = stmt.slice(7, -1).trim();
      if (expr === '' || expr === '0' || expr === ';') return { returnValue: undefined };
      return { returnValue: this.evalExpr(expr) };
    }
    if (stmt === 'return;') {
      return { returnValue: undefined };
    }

    // ===== 简单语句 =====

    // printf
    if (stmt.startsWith('printf(')) {
      this.execPrintf(stmt);
      return null;
    }

    // scanf
    if (stmt.startsWith('scanf(')) {
      this.execScanf(stmt);
      return null;
    }

    // fgets (简化为读取一行)
    if (stmt.includes('fgets(')) {
      this.execFgets(stmt);
      return null;
    }

    // strlen (作为表达式)
    if (stmt.includes('strlen(')) {
      const match = /(\w+)\s*=\s*strlen\((\w+)\)\s*;/.exec(stmt);
      if (match) {
        const varName = match[1];
        const strVar = match[2];
        const strVal = this.variables[strVar] || '';
        this.variables[varName] = strVal.length;
      }
      return null;
    }

    // 数组声明（带初始化）- 必须在通用声明之前
    const arrDecl = /^(int|float|double|char)\s+(\w+)\[(\d*)\]\s*=\s*\{([^}]+)\}\s*;/.exec(stmt);
    if (arrDecl) {
      const name = arrDecl[2];
      const values = arrDecl[4].split(',').map(v => this.evalExpr(v.trim()));
      this.arrays[name] = values;
      this.variables[name] = values;
      return null;
    }

    // char 数组（字符串）- 必须在通用声明之前
    const charArr = /^char\s+(\w+)\[(?:\d+)?\]\s*=\s*"([^"]*)"\s*;/.exec(stmt);
    if (charArr) {
      this.variables[charArr[1]] = charArr[2];
      return null;
    }

    // 变量声明（带初始化）- 支持 int a=5; 和 int a=5,b=10; 和 float w=5.0,h=3.0;
    const declMatch = /^(int|float|double|char)\s+(.+)\s*;/.exec(stmt);
    if (declMatch) {
      const type = declMatch[1];
      const rest = declMatch[2];
      // 跳过数组声明（变量名后直接跟 [）
      if (/^\w+\s*\[/.test(rest)) return null;
      const parts = splitArgs(rest);
      for (const part of parts) {
        const eqIdx = part.indexOf('=');
        if (eqIdx >= 0) {
          const name = part.slice(0, eqIdx).trim();
          const val = this.evalExpr(part.slice(eqIdx + 1).trim());
          this.variables[name] = type === 'int' ? Math.floor(val) : val;
        } else {
          this.variables[part.trim()] = 0;
        }
      }
      return null;
    }

    // 数组声明（无初始化）
    const arrDecl2 = /^(int|float|double|char)\s+(\w+)\[(\d+)\]\s*;/.exec(stmt);
    if (arrDecl2) {
      const name = arrDecl2[2];
      const size = parseInt(arrDecl2[3]);
      this.arrays[name] = new Array(size).fill(0);
      this.variables[name] = this.arrays[name];
      return null;
    }

    // 变量声明（无初始化）- 支持 int a; 和 int a,b;
    const decl2 = /^(int|float|double|char)\s+([\w\s,]+)\s*;/.exec(stmt);
    if (decl2) {
      const names = decl2[2].split(',').map(n => n.trim());
      names.forEach(n => { if (n) this.variables[n] = 0; });
      return null;
    }

    // 赋值语句（含数组下标赋值）
    const arrAssign = /^(\w+)\[(\w+|\d+)\]\s*=\s*(.+)\s*;/.exec(stmt);
    if (arrAssign) {
      const arrName = arrAssign[1];
      const idx = this.evalExpr(arrAssign[2]);
      const val = this.evalExpr(arrAssign[3]);
      if (this.arrays[arrName]) {
        this.arrays[arrName][idx] = val;
      }
      return null;
    }

    // 普通赋值
    const assignMatch = /^(\w+)\s*=\s*(.+)\s*;/.exec(stmt);
    if (assignMatch) {
      const name = assignMatch[1];
      const value = this.evalExpr(assignMatch[2]);
      this.variables[name] = value;
      return null;
    }

    // 指针解引用赋值
    const ptrAssign = /^\*(\w+)\s*=\s*(.+)\s*;/.exec(stmt);
    if (ptrAssign) {
      const ptrName = ptrAssign[1];
      const value = this.evalExpr(ptrAssign[2]);
      const addr = this.variables[ptrName];
      if (addr) {
        if (typeof addr === 'string' && addr.startsWith('_PTR_')) {
          const realVar = addr.slice(5);
          if (this.variables[realVar] !== undefined) this.variables[realVar] = value;
        } else if (this.variables[addr] !== undefined) {
          this.variables[addr] = value;
        }
      }
      return null;
    }

    // 自增/自减语句 (i++, ++i, i--, --i)
    if (/^\w+\+\+;/.test(stmt) || /^\+\+\w+;/.test(stmt)) {
      const varName = stmt.replace(/[+;]/g, '').trim();
      this.variables[varName] = (this.variables[varName] || 0) + 1;
      return null;
    }
    if (/^\w+--;/.test(stmt) || /^--\w+;/.test(stmt)) {
      const varName = stmt.replace(/[-;]/g, '').trim();
      this.variables[varName] = (this.variables[varName] || 0) - 1;
      return null;
    }

    // 未知语句（静默忽略，教学环境容错）
    return null;
  }

  // 提取 if/for 条件
  extractCond(stmt) {
    // 匹配 (condition) 后的内容
    const m = /^[a-z]+\s*\((.+?)\)\s*(.+)$/s.exec(stmt);
    if (!m) return null;
    return { condition: m[1].trim(), rest: m[2].trim() };
  }

  // 提取语句体（支持 {block} 和 single-statement）
  extractBody(stmt, keyword) {
    // 去掉关键字和条件
    const afterKeyword = stmt.slice(keyword.length).trim();
    const m = /^\((.+?)\)\s*(.+)$/s.exec(afterKeyword);
    if (!m) return null;
    const rest = m[2].trim();
    if (rest.startsWith('{')) {
      // 花括号块
      return { body: rest.slice(1, rest.lastIndexOf('}')).trim(), hasBraces: true };
    }
    // 单语句体（以 ; 结尾）
    const semiIdx = rest.indexOf(';');
    if (semiIdx >= 0) {
      return { body: rest.slice(0, semiIdx + 1), hasBraces: false };
    }
    return { body: rest, hasBraces: false };
  }

  extractCondBody(stmt, keyword) {
    return this.extractBody(stmt, keyword);
  }

  // ============ if 语句 ============
  execIf(stmt, allStmts, idx) {
    const eb = this.extractBody(stmt, 'if');
    if (!eb) {
      // 旧格式兼容
      const condMatch = /^if\s*\((.+)\)\s*(.+)$/s.exec(stmt);
      if (!condMatch) return null;
      const condition = condMatch[1].trim();
      const rest = condMatch[2].trim();
      let body;
      if (rest.startsWith('{')) {
        body = rest.slice(1, rest.lastIndexOf('}')).trim();
      } else {
        body = rest;
      }
      const result = this.evalCondition(condition);
      if (result) {
        if (body.startsWith('{')) {
          this.executeBlock(body.slice(1, body.lastIndexOf('}')).trim());
        } else {
          this.executeBlock(body);
        }
      }
      return null;
    }

    const condition = /^\((.+)\)$/.exec(stmt.slice(2).trim().split(/\{|\n/)[0])?.[1] || '';
    // 简单方法：找 ) 后的所有内容
    const parenClose = stmt.indexOf(')', stmt.indexOf('(') + 1);
    const condStr = stmt.slice(stmt.indexOf('(') + 1, parenClose).trim();
    const restStr = stmt.slice(parenClose + 1).trim();

    let body;
    if (restStr.startsWith('{')) {
      body = restStr.slice(1, restStr.lastIndexOf('}')).trim();
    } else {
      body = restStr;
    }

    const result = this.evalCondition(condStr);

    if (result) {
      this.executeBlock(body);
    } else {
      // 检查 else if / else 链
      let j = idx + 1;
      let foundElse = false;

      while (j < allStmts.length) {
        const next = allStmts[j].trim();
        if (/^else\s+if\s*\(/.test(next)) {
          if (foundElse) break;
          const eiRest = next.slice(next.indexOf(')', next.indexOf('(')) + 1).trim();
          let eiBody;
          if (eiRest.startsWith('{')) {
            eiBody = eiRest.slice(1, eiRest.lastIndexOf('}')).trim();
          } else {
            eiBody = eiRest;
          }
          const eiCond = next.slice(next.indexOf('(') + 1, next.indexOf(')')).trim();
          if (this.evalCondition(eiCond)) {
            this.executeBlock(eiBody);
            return { skipTo: j + 1 };
          }
          j++;
        } else if (/^else\s*\{/.test(next) || /^else\s+\w/.test(next)) {
          foundElse = true;
          const elRest = next.slice(4).trim();
          let elBody;
          if (elRest.startsWith('{')) {
            elBody = elRest.slice(1, elRest.lastIndexOf('}')).trim();
          } else {
            elBody = elRest;
          }
          this.executeBlock(elBody);
          return { skipTo: j + 1 };
        } else {
          break;
        }
      }
    }

    return null;
  }

  // ============ for 循环 ============
  execFor(stmt) {
    // 找 ( 和匹配的 )
    const openParen = stmt.indexOf('(');
    const closeParen = this.findMatchingParen(stmt, openParen);
    if (closeParen < 0) return null;

    const forHead = stmt.slice(openParen + 1, closeParen).trim();
    const parts = forHead.split(';');
    if (parts.length !== 3) return null;

    const init = parts[0].trim();
    const cond = parts[1].trim();
    const update = parts[2].trim();

    const rest = stmt.slice(closeParen + 1).trim();
    let body;
    if (rest.startsWith('{')) {
      body = rest.slice(1, rest.lastIndexOf('}')).trim();
    } else {
      body = rest;
    }

    // 执行初始化
    if (init) this.executeStatement(init + (init.endsWith(';') ? '' : ';'), [], 0);

    // 循环
    let iterations = 0;
    while (cond ? this.evalCondition(cond) : true) {
      if (iterations++ > 5000) throw new Error('循环次数超限');
      const result = this.executeBlock(body);
      if (result === 'break') break;
      if (update) this.executeStatement(update + (update.endsWith(';') ? '' : ';'), [], 0);
      if (!cond) break;
    }

    return null;
  }

  // 找匹配的右括号
  findMatchingParen(str, openIdx) {
    let depth = 0;
    for (let i = openIdx; i < str.length; i++) {
      if (str[i] === '(') depth++;
      else if (str[i] === ')') {
        depth--;
        if (depth === 0) return i;
      }
    }
    return -1;
  }

  // ============ while 循环 ============
  execWhile(stmt) {
    const openParen = stmt.indexOf('(');
    const closeParen = this.findMatchingParen(stmt, openParen);
    if (closeParen < 0) return null;

    const cond = stmt.slice(openParen + 1, closeParen).trim();
    const rest = stmt.slice(closeParen + 1).trim();
    let body;
    if (rest.startsWith('{')) {
      body = rest.slice(1, rest.lastIndexOf('}')).trim();
    } else {
      body = rest;
    }

    let iterations = 0;
    while (this.evalCondition(cond)) {
      if (iterations++ > 5000) throw new Error('循环次数超限');
      const result = this.executeBlock(body);
      if (result === 'break') break;
    }

    return null;
  }

  execDoWhile(stmt) {
    const match = /^do\s*\{(.+)\}\s*while\s*\((.+)\)\s*;/.exec(stmt);
    if (!match) return null;

    const body = match[1].trim();
    const cond = match[2].trim();

    let iterations = 0;
    do {
      if (iterations++ > 5000) throw new Error('循环次数超限');
      const result = this.executeBlock(body);
      if (result === 'break') break;
    } while (this.evalCondition(cond));

    return null;
  }

  // ============ printf ============
  execPrintf(stmt) {
    const match = /^printf\("([^"]*)"(?:,\s*(.+))?\)\s*;/.exec(stmt);
    if (!match) {
      const m2 = /printf\(([^)]+)\)\s*;/.exec(stmt);
      if (m2) {
        this.output += '[printf: ' + m2[1] + ']\n';
        return;
      }
      return;
    }

    let fmt = match[1];
    const args = splitArgs(match[2] || '');

    // 处理转义字符
    fmt = fmt.replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\"/g, '"');

    // 格式化替换
    let argIdx = 0;
    let result = '';
    let i = 0;

    while (i < fmt.length) {
      if (fmt[i] === '%' && i + 1 < fmt.length) {
        i++;
        let spec = '%';

        // 处理 .2f 这样的格式
        while (i < fmt.length && /[.0-9]/.test(fmt[i])) {
          spec += fmt[i];
          i++;
        }
        if (i < fmt.length) {
          spec += fmt[i];
          i++;
        }

        const val = argIdx < args.length ? this.evalExpr(args[argIdx++]) : 0;

        if (spec.endsWith('d') || spec.includes('d')) {
          result += Math.floor(Number(val));
        } else if (spec.endsWith('f') || spec.includes('f')) {
          const precision = spec.match(/\.(\d+)/);
          const p = precision ? parseInt(precision[1]) : 6;
          result += Number(val).toFixed(p);
        } else if (spec.endsWith('c')) {
          result += String.fromCharCode(Number(val));
        } else if (spec.endsWith('s')) {
          result += String(val !== undefined && val !== null ? val : '');
        } else if (spec.endsWith('p')) {
          result += '0x' + Number(val).toString(16);
        }
      } else {
        result += fmt[i];
        i++;
      }
    }

    this.output += result;
  }

  // ============ scanf ============
  execScanf(stmt) {
    const match = /^scanf\("([^"]*)"(?:,\s*(.+))?\)\s*;/.exec(stmt);
    if (!match) return;

    const fmt = match[1];
    const args = match[2] ? match[2].split(',').map(a => a.trim()) : [];

    for (let i = 0; i < fmt.length - 1; i++) {
      if (fmt[i] === '%') {
        const spec = fmt[i+1];
        const arg = args.shift();
        if (!arg) continue;

        // 提取变量名（去掉 & 前缀）
        const varName = arg.replace(/^&/, '').trim();
        const val = this.inputQueue.length > 0 ? this.inputQueue.shift() : '0';

        if (spec === 'd') {
          this.variables[varName] = parseInt(val) || 0;
        } else if (spec === 'f' || spec === 'l') {
          this.variables[varName] = parseFloat(val) || 0;
        } else if (spec === 's') {
          this.variables[varName] = String(val);
        } else if (spec === 'c') {
          this.variables[varName] = String(val)[0] || '';
        }
        i++; // skip specifier
      }
    }
  }

  execFgets(stmt) {
    const match = /fgets\((\w+),\s*\d+,\s*stdin\)\s*;/.exec(stmt);
    if (match) {
      const varName = match[1];
      const val = this.inputQueue.length > 0 ? this.inputQueue.shift() : '';
      this.variables[varName] = String(val);
    }
  }

  // ============ 表达式求值 ============
  evalExpr(expr) {
    expr = expr.trim();

    // 函数调用
    const funcCall = /^(\w+)\(([^)]*)\)$/.exec(expr);
    if (funcCall) {
      const fname = funcCall[1];
      const args = funcCall[2].split(',').map(a => this.evalExpr(a.trim())).filter(a => a !== '' && a !== undefined);

      // strlen
      if (fname === 'strlen') {
        return String(this.variables[funcCall[2].trim()] || funcCall[2].trim().replace(/"/g, '')).length;
      }
      // isupper
      if (fname === 'isupper') {
        const c = String(this.variables[funcCall[2].trim()] || funcCall[2].trim());
        return (c[0] >= 'A' && c[0] <= 'Z') ? 1 : 0;
      }
      // islower
      if (fname === 'islower') {
        const c = String(this.variables[funcCall[2].trim()] || funcCall[2].trim());
        return (c[0] >= 'a' && c[0] <= 'z') ? 1 : 0;
      }
      // isdigit
      if (fname === 'isdigit') {
        const c = String(this.variables[funcCall[2].trim()] || funcCall[2].trim());
        return (c[0] >= '0' && c[0] <= '9') ? 1 : 0;
      }
      // isalpha
      if (fname === 'isalpha') {
        const c = String(this.variables[funcCall[2].trim()] || funcCall[2].trim());
        return ((c[0] >= 'a' && c[0] <= 'z') || (c[0] >= 'A' && c[0] <= 'Z')) ? 1 : 0;
      }
      // toupper
      if (fname === 'toupper') {
        const c = String(this.variables[funcCall[2].trim()] || funcCall[2].trim());
        return c[0]?.toUpperCase()?.charCodeAt(0) || 0;
      }
      // tolower
      if (fname === 'tolower') {
        const c = String(this.variables[funcCall[2].trim()] || funcCall[2].trim());
        return c[0]?.toLowerCase()?.charCodeAt(0) || 0;
      }

      // 自定义函数
      if (this.functions[fname]) {
        const func = this.functions[fname];
        const paramNames = func.params.map(p => p.replace(/^\w+\s+/, '').trim());
        // 保存旧变量
        const saved = {};
        for (let i = 0; i < paramNames.length; i++) {
          saved[paramNames[i]] = this.variables[paramNames[i]];
          this.variables[paramNames[i]] = args[i] || 0;
        }
        const result = this.executeBlock(func.body);
        // 恢复
        for (const [k, v] of Object.entries(saved)) {
          if (v !== undefined) this.variables[k] = v;
        }
        return result?.returnValue || 0;
      }

      return 0;
    }

    // 数组下标访问
    const arrAccess = /^(\w+)\[(\w+|\d+)\]$/.exec(expr);
    if (arrAccess) {
      const arrName = arrAccess[1];
      const idx = this.evalExpr(arrAccess[2]);
      if (this.arrays[arrName]) {
        return this.arrays[arrName][idx] || 0;
      }
      if (this.variables[arrName] && Array.isArray(this.variables[arrName])) {
        return this.variables[arrName][idx] || 0;
      }
      // 字符串作为字符数组
      if (typeof this.variables[arrName] === 'string') {
        return this.variables[arrName].charCodeAt(idx) || 0;
      }
      return 0;
    }

    // 解引用
    if (expr.startsWith('*')) {
      const ptrName = expr.slice(1).trim();
      const addr = this.variables[ptrName];
      if (addr) {
        // 处理 _PTR_ 前缀（模拟指针）
        if (typeof addr === 'string' && addr.startsWith('_PTR_')) {
          const realVar = addr.slice(5);
          if (this.variables[realVar] !== undefined) return this.variables[realVar];
        }
        // 直接地址
        if (this.variables[addr] !== undefined) return this.variables[addr];
      }
      return 0;
    }

    // 取地址（&var）
    if (expr.startsWith('&')) {
      const ptrName = expr.slice(1).trim();
      // 使用特殊前缀避免与变量名冲突
      return '_PTR_' + ptrName;
    }

    // 字符串字面量
    if (expr.startsWith('"') && expr.endsWith('"')) {
      return expr.slice(1, -1);
    }

    // 字符字面量
    if (expr.startsWith("'") && expr.endsWith("'")) {
      return expr.charCodeAt(1);
    }

    // 数字
    if (/^-?\d+(\.\d+)?$/.test(expr)) {
      return parseFloat(expr);
    }

    // 括号表达式
    if (expr.startsWith('(') && expr.endsWith(')')) {
      return this.evalExpr(expr.slice(1, -1).trim());
    }

    // 三元运算 a?b:c
    if (expr.includes('?') && expr.includes(':')) {
      const q = expr.indexOf('?');
      const cond = expr.slice(0, q).trim();
      const rest = expr.slice(q + 1);
      // 找到匹配的 :
      let depth = 0;
      let colonIdx = -1;
      for (let i = 0; i < rest.length; i++) {
        if (rest[i] === '(') depth++;
        if (rest[i] === ')') depth--;
        if (rest[i] === ':' && depth === 0) { colonIdx = i; break; }
      }
      if (colonIdx >= 0) {
        const trueVal = rest.slice(0, colonIdx).trim();
        const falseVal = rest.slice(colonIdx + 1).trim();
        return this.evalCondition(cond) ? this.evalExpr(trueVal) : this.evalExpr(falseVal);
      }
    }

    // 简单二元运算
    if (/[+\-*/<>!=]/.test(expr) && !/^['"]/.test(expr)) {
      return this.evalBinaryOp(expr);
    }

    // 变量
    if (this.variables[expr] !== undefined) {
      return this.variables[expr];
    }

    // 尝试作为字符串
    return expr;
  }

  // 找最右边、深度为0的算术运算符（避免匹配括号内的运算符）
  matchLastOperator(expr) {
    let depth = 0;
    let bestIdx = -1;
    let bestOp = '';
    for (let i = expr.length - 1; i >= 0; i--) {
      const ch = expr[i];
      if (ch === ')') depth++;
      else if (ch === '(') depth--;
      else if (depth === 0 && /[+\-*/]/.test(ch)) {
        // 跳过前导符号（如 -5 中的负号）
        if (ch === '-' && (i === 0 || /[+\-*/(]/.test(expr[i-1]))) continue;
        if (ch === '+' && (i === 0 || /[+\-*/(]/.test(expr[i-1]))) continue;
        bestIdx = i;
        bestOp = ch;
        break;
      }
    }
    if (bestIdx < 0) return null;
    return {
      l: expr.slice(0, bestIdx).trim(),
      op: bestOp,
      r: expr.slice(bestIdx + 1).trim()
    };
  }

  evalBinaryOp(expr) {
    // 比较运算
    if (expr.includes('>=')) {
      const [l, r] = expr.split('>=');
      return this.evalExpr(l.trim()) >= this.evalExpr(r.trim()) ? 1 : 0;
    }
    if (expr.includes('<=')) {
      const [l, r] = expr.split('<=');
      return this.evalExpr(l.trim()) <= this.evalExpr(r.trim()) ? 1 : 0;
    }
    if (expr.includes('!=')) {
      const [l, r] = expr.split('!=');
      return this.evalExpr(l.trim()) != this.evalExpr(r.trim()) ? 1 : 0;
    }
    if (expr.includes('==')) {
      const [l, r] = expr.split('==');
      return this.evalExpr(l.trim()) == this.evalExpr(r.trim()) ? 1 : 0;
    }
    if (expr.includes('>')) {
      const [l, r] = expr.split('>');
      return this.evalExpr(l.trim()) > this.evalExpr(r.trim()) ? 1 : 0;
    }
    if (expr.includes('<')) {
      const [l, r] = expr.split('<');
      return this.evalExpr(l.trim()) < this.evalExpr(r.trim()) ? 1 : 0;
    }

    // 算术运算（从右往左找最外层运算符，避免括号内运算符被误匹配）
    const arithMatch = this.matchLastOperator(expr);
    if (arithMatch) {
      const l = this.evalExpr(arithMatch.l);
      const op = arithMatch.op;
      const r = this.evalExpr(arithMatch.r);

      switch (op) {
        case '+': return Number(l) + Number(r);
        case '-': return Number(l) - Number(r);
        case '*': return Number(l) * Number(r);
        case '/': return Number(l) / Number(r);
      }
    }

    return 0;
  }

  evalCondition(cond) {
    cond = cond.trim();
    if (!cond) return false;

    // 包含逻辑与
    if (cond.includes('&&')) {
      const parts = cond.split('&&');
      return parts.every(p => this.evalCondition(p.trim()));
    }

    // 包含逻辑或
    if (cond.includes('||')) {
      const parts = cond.split('||');
      return parts.some(p => this.evalCondition(p.trim()));
    }

    // 比较运算
    if (/[<>=!]/.test(cond) && !/[+\-*/]/.test(cond)) {
      return this.evalExpr(cond) !== 0;
    }

    // 简单布尔值
    const val = this.evalExpr(cond);
    return val !== 0 && val !== false && val !== '' && val !== undefined;
  }

  // ============ 结构体 ============
  execStructDef(stmt) {
    const match = /^struct\s+(\w+)\s*\{([^}]+)\}\s*;/.exec(stmt);
    if (match) {
      const name = match[1];
      const fields = match[2].split(';').filter(Boolean).map(f => {
        const parts = f.trim().split(/\s+/);
        return { type: parts[0], name: parts[1].replace(/\[.*\]/, '') };
      });
      this.structs[name] = fields;
    }
  }
}

// 智能分割参数（不拆分嵌套函数调用中的逗号）
function splitArgs(str) {
  if (!str) return [];
  const args = [];
  let depth = 0;
  let current = '';
  for (const ch of str) {
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    if (ch === ',' && depth === 0) {
      args.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  if (current.trim()) args.push(current.trim());
  return args;
}

module.exports = { CSimulator };
