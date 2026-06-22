# Imagem de produção da API RH-System (Node 20 + Chromium para PDFs via Puppeteer).
# Build context: raiz do monorepo (não a pasta backend/).

FROM node:20-bookworm-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        chromium \
        fonts-liberation \
        ca-certificates \
    && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app

COPY package.json package-lock.json ./
COPY backend/package.json ./backend/

RUN npm ci --omit=dev --workspace=backend --ignore-scripts

WORKDIR /app/backend

COPY backend/prisma ./prisma
COPY backend/prisma.config.ts ./
RUN npx prisma generate

COPY backend/src ./src

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD node -e "fetch('http://127.0.0.1:3000/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "src/server.js"]
