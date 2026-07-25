FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache openssl libc6-compat
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* turbo.json tsconfig.base.json ./
COPY packages ./packages
COPY apps/workers ./apps/workers
COPY apps/backend ./apps/backend
RUN ln -s /app/apps/backend /app/apps/workers/backend
RUN pnpm install --frozen-lockfile=false
RUN npm install -g prisma@5.20.0
RUN prisma generate --schema=/app/apps/backend/prisma/schema.prisma

WORKDIR /app/apps/workers
CMD ["npx", "tsx", "src/index.ts"]
