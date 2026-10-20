// Локальный PostgreSQL без Docker: бинарники из пакета embedded-postgres.
// Данные переживают перезапуск. Запуск: pnpm db:local (держите процесс открытым, Ctrl+C — остановка).
//
// Почему не класс EmbeddedPostgres: initdb в UTF-8 падает, если путь к бинарникам или данным
// содержит не-ASCII символы (например, C:\Users\админ). Для такого пути копируем бинарники
// один раз в ASCII-каталог. UTF-8 обязателен для казахских букв (ә, ғ, қ, ң, ө, ұ, ү, һ, і).
import 'dotenv/config';
import { spawn, spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import pg from 'pg';

const user = process.env.POSTGRES_USER ?? 'postgres';
const password = process.env.POSTGRES_PASSWORD ?? 'postgres';
const database = process.env.POSTGRES_DB ?? 'dalago';
const port = Number(process.env.POSTGRES_PORT ?? 5432);

const isAscii = (value) => [...value].every((char) => char.charCodeAt(0) < 128);
const projectDir = path.resolve('.local-db');
const baseDir =
  process.env.LOCAL_DB_DIR ??
  (isAscii(projectDir)
    ? projectDir
    : path.join(process.env.ProgramData ?? os.tmpdir(), 'dalago-db'));
const dataDir = path.join(baseDir, 'data');

const binaries = await loadBinaries();

if (!existsSync(path.join(dataDir, 'PG_VERSION'))) {
  mkdirSync(baseDir, { recursive: true });
  const pwfile = path.join(baseDir, 'pwfile');
  writeFileSync(pwfile, password);
  const result = spawnSync(
    binaries.initdb,
    ['-D', dataDir, '-U', user, `--pwfile=${pwfile}`, '-A', 'scram-sha-256', '-E', 'UTF8', '--locale=C'],
    { stdio: 'inherit' },
  );
  rmSync(pwfile, { force: true });

  if (result.status !== 0) {
    throw new Error('initdb failed');
  }
}

const server = spawn(binaries.postgres, ['-D', dataDir, '-p', String(port), '-c', 'listen_addresses=localhost']);
await new Promise((resolve, reject) => {
  const onData = (chunk) => {
    const text = chunk.toString();

    if (process.env.DB_LOG) {
      process.stderr.write(text);
    }

    if (text.includes('ready to accept connections')) {
      resolve();
    }

    if (text.includes('FATAL')) {
      reject(new Error(text));
    }
  };
  server.stderr.on('data', onData);
  server.stdout.on('data', onData);
  server.on('exit', (code) => reject(new Error(`postgres exited with code ${code}`)));
});

const client = new pg.Client({ host: 'localhost', port, user, password, database: 'postgres' });
await client.connect();
const exists = await client.query('select 1 from pg_database where datname = $1', [database]);

if (exists.rowCount === 0) {
  await client.query(`create database "${database.replace(/"/g, '')}" encoding 'UTF8'`);
}

await client.end();

console.log(`Data directory: ${dataDir}`);
console.log(`PostgreSQL is running: postgresql://${user}:***@localhost:${port}/${database}`);

const stop = () => {
  spawnSync(binaries.pgCtl, ['stop', '-D', dataDir, '-m', 'fast'], { stdio: 'ignore' });
  process.exit(0);
};

process.on('SIGINT', stop);
process.on('SIGTERM', stop);

async function loadBinaries() {
  const platformPackage = {
    'win32-x64': '@embedded-postgres/windows-x64',
    'linux-x64': '@embedded-postgres/linux-x64',
    'linux-arm64': '@embedded-postgres/linux-arm64',
    'darwin-x64': '@embedded-postgres/darwin-x64',
    'darwin-arm64': '@embedded-postgres/darwin-arm64',
  }[`${process.platform}-${process.arch}`];

  if (!platformPackage) {
    throw new Error(`Unsupported platform ${process.platform}-${process.arch}; use Docker instead`);
  }

  const requireFromHere = createRequire(import.meta.url);
  const requireFromLib = createRequire(requireFromHere.resolve('embedded-postgres'));
  const entry = requireFromLib.resolve(platformPackage);
  const { initdb, postgres, pg_ctl } = await import(pathToFileURL(entry).href);
  const nativeDir = path.dirname(path.dirname(initdb));

  if (isAscii(nativeDir)) {
    return { initdb, postgres, pgCtl: pg_ctl };
  }

  const copyDir = path.join(baseDir, 'pg-bin');

  if (!existsSync(path.join(copyDir, 'bin'))) {
    console.log(`Copying PostgreSQL binaries to ${copyDir} (one time)...`);
    cpSync(nativeDir, copyDir, { recursive: true, dereference: true });
  }

  const relocate = (file) => path.join(copyDir, 'bin', path.basename(file));

  return { initdb: relocate(initdb), postgres: relocate(postgres), pgCtl: relocate(pg_ctl) };
}
