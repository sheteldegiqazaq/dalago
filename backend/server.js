// Точка входа для Vercel: запускает собранное приложение из dist.
// nest build переписывает псевдонимы путей (@shared/*, @app/*) в относительные, а сборщик Vercel — нет.
// Nest работает поверх Express; пресет Express на Vercel ищет файл, который импортирует express.
require('express');
require('./dist/src/main.js');
