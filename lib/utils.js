import path from 'path';

const APP_ROOT = path.join(__dirname, '..');

export function isProduction() {
  return process.env.NODE_ENV === 'production';
}

export function appRoot() {return APP_ROOT;}
