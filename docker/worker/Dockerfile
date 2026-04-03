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

FROM node:${NODE_VERSION}-slim AS isolate-builder
RUN apt-get update && apt-get install -y --no-install-recommends \
    git gcc make pkg-config libcap-dev libsystemd-dev libc6-dev ca-certificates \
    && rm -rf /var/lib/apt/lists/*
RUN git clone https://github.com/ioi/isolate.git /isolate
WORKDIR /isolate
RUN make isolate && make install

FROM node:${NODE_VERSION}-slim AS runner
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN pnpm add -g tsx

WORKDIR /app

# Install isolate runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    libcap2 libsystemd0 \
    && rm -rf /var/lib/apt/lists/*

# Copy isolate binary and config
COPY --from=isolate-builder /usr/local/bin/isolate /usr/local/bin/isolate
COPY --from=isolate-builder /usr/local/etc/isolate /usr/local/etc/isolate

COPY --from=builder /app .

CMD ["tsx","apps/worker/src/index.ts"]
