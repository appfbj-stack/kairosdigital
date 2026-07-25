const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
async function main() {
  const tenants = await p.tenant.findMany({ take: 2 });
  console.log('Tenants:', tenants.length);
  for (const t of tenants) console.log(' -', t.id, t.name);
  const users = await p.user.findMany({ take: 2 });
  console.log('Users:', users.length);
  for (const u of users) console.log(' -', u.id, u.email, u.role, u.tenantId);
  const pl = await p.pipeline.findMany();
  console.log('Pipelines:', pl.length);
  for (const pp of pl) console.log(' -', pp.id, pp.name, pp.tenantId);
  await p.$disconnect();
}
main().catch(e => console.error(e.message));
