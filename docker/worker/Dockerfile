ARG NODE_VERSION=24.13.1
FROM node:${NODE_VERSION}-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS prepare
WORKDIR /app
COPY package.json . 
RUN pnpm add -g turbo
COPY . .
RUN turbo prune worker --docker

FROM base AS builder
WORKDIR /app

COPY --from=prepare /app/out/json/ .
RUN pnpm install

COPY --from=prepare /app/out/full/ .

FROM base AS runner
WORKDIR /app
RUN pnpm add -g tsx

RUN addgroup --system --gid 1001 worker
RUN adduser --system --uid 1001 worker
USER worker

COPY --from=builder /app .

CMD ["tsx","apps/worker/src/index.ts"]
