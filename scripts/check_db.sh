#!/bin/bash
docker exec kairos-postgres psql -U kairos -d kairosdigital -c 'SELECT count(*) FROM "Pipeline";'
docker exec kairos-postgres psql -U kairos -d kairosdigital -c 'SELECT id, name FROM "Tenant" LIMIT 5;'
docker exec kairos-postgres psql -U kairos -d kairosdigital -c 'SELECT id, email, role, "tenantId" FROM "User" LIMIT 5;'
