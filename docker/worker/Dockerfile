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

FROM base AS isolate-builder
RUN apk add --no-cache git gcc make musl-dev libcap-dev
RUN git clone https://github.com/ioi/isolate.git /isolate
WORKDIR /isolate
RUN make isolate

FROM base AS builder
WORKDIR /app

COPY --from=prepare /app/out/json/ .
RUN pnpm install

COPY --from=prepare /app/out/full/ .

FROM base AS runner
WORKDIR /app
RUN pnpm add -g tsx

RUN apk add --no-cache libcap

COPY --from=isolate-builder /isolate/isolate /usr/local/bin/isolate
COPY --from=isolate-builder /isolate/default.cf /usr/local/etc/isolate

COPY --from=builder /app .

CMD ["tsx","apps/worker/src/index.ts"]
