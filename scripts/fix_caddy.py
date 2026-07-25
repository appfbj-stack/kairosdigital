import subprocess
r = subprocess.run(['cat','/etc/caddy/Caddyfile'],capture_output=True,text=True)
c = r.stdout
old = 'crm.kairosk.fbautomacao.space {\n reverse_proxy 127.0.0.1:3008\n}'
new = 'crm.kairosk.fbautomacao.space {\n    handle /api/* {\n        reverse_proxy 127.0.0.1:3001\n    }\n    handle {\n        reverse_proxy 127.0.0.1:3008\n    }\n}'
c = c.replace(old,new)
open('/etc/caddy/Caddyfile','w').write(c)
print('OK')
