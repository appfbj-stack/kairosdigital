import subprocess, json
r = subprocess.run(['docker','exec','kairos-postgres','psql','-U','kairos','-d','kairosdigital','-tA', '-c', 'SELECT count(*) FROM "Pipeline";'], capture_output=True, text=True)
print("Pipeline count:", r.stdout.strip())
r2 = subprocess.run(['docker','exec','kairos-postgres','psql','-U','kairos','-d','kairosdigital','-tA', '-c', 'SELECT "tenantId" FROM "Pipeline" LIMIT 1;'], capture_output=True, text=True)
print("Tenant ID of first pipeline:", r2.stdout.strip())
r3 = subprocess.run(['docker','exec','kairos-postgres','psql','-U','kairos','-d','kairosdigital','-tA', '-c', 'SELECT id, name FROM "Tenant" LIMIT 5;'], capture_output=True, text=True)
print("Tenants:\n", r3.stdout)
