import { readFileSync, writeFileSync } from 'node:fs';

const databaseId = process.env.QIXIN_D1_ID;
if (!/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(databaseId ?? '') ||
    databaseId === '00000000-0000-4000-8000-000000000000') {
  throw new Error('Set QIXIN_D1_ID to the production Cloudflare D1 database UUID.');
}
const file = new URL('../dist/server/wrangler.json', import.meta.url);
const config = JSON.parse(readFileSync(file, 'utf8'));
const binding = config.d1_databases.find(database => database.binding === 'DB');
if (!binding) throw new Error('Missing database binding DB in the production build');
Object.assign(binding, {database_name: 'qixin-sanctuary', database_id: databaseId, migrations_dir: '../../drizzle'});
config.name = 'qixin-sanctuary';
writeFileSync(file, JSON.stringify(config, null, 2));
