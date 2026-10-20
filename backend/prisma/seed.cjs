process.env.TS_NODE_PREFER_TS_EXTS = 'true';
process.env.TS_NODE_TRANSPILE_ONLY = 'true';

// Сгенерированный Prisma-клиент импортирует './x.js', а на диске лежит './x.ts'.
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const resolveFilename = Module._resolveFilename;

Module._resolveFilename = function (request, parent, ...rest) {
  if (request.startsWith('.') && request.endsWith('.js') && parent?.filename) {
    const candidate = path.resolve(path.dirname(parent.filename), `${request.slice(0, -3)}.ts`);

    if (fs.existsSync(candidate)) {
      return resolveFilename.call(this, candidate, parent, ...rest);
    }
  }

  return resolveFilename.call(this, request, parent, ...rest);
};

require('ts-node/register');
require('tsconfig-paths/register');
require('./seed.ts');
