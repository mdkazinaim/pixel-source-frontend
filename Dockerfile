# ──────────────────────────────────────────
# Stage 1: Builder
# ──────────────────────────────────────────
FROM node:20-bullseye AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

COPY . .
RUN npm run build

# ──────────────────────────────────────────
# Stage 2: Runtime
# ──────────────────────────────────────────
FROM node:20-bullseye AS runtime

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/next.config.ts ./
COPY --from=builder /usr/src/app/public ./public
COPY --from=builder /usr/src/app/.next ./.next
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package.json ./package.json

ENV NODE_ENV=production

EXPOSE 3000

CMD ["npm", "start"]
