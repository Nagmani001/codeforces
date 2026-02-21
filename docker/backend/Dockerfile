ARG NODE_VERSION=24.11.0

FROM node:${NODE_VERSION}-alpine AS base

FROM base AS prepare 
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune backend --docker

FROM base AS builder 
WORKDIR /app
RUN npm install -g pnpm@9.0.0
COPY --from=prepare /app/out/json/ .
RUN pnpm install
COPY --from=prepare /app/out/full/ .
RUN cd packages/database && pnpm dlx prisma@6.3.0 generate
RUN pnpm run build

FROM base AS runner
WORKDIR /app

# Copy built backend
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist

# Copy package.json files for production install
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder /app/turbo.json ./turbo.json

# Copy workspace package.json files
COPY --from=builder /app/apps/backend/package.json ./apps/backend/package.json
COPY --from=builder /app/packages/database/package.json ./packages/database/package.json
COPY --from=builder /app/packages/database/prisma ./packages/database/prisma

# Install pnpm and production dependencies  
RUN npm install -g pnpm@9.0.0
RUN pnpm install --prod --frozen-lockfile

# Generate Prisma client in runner stage (same alpine platform as builder)
RUN cd packages/database && pnpm dlx prisma@6.3.0 generate

# Ensure @prisma/client is accessible and query engine is in the right location
RUN PRISMA_PKG_DIR=$(find /app/node_modules/.pnpm -maxdepth 1 -type d -name "*@prisma+client*" 2>/dev/null | head -1) && \
    if [ -n "$PRISMA_PKG_DIR" ]; then \
        EXPECTED_PRISMA_DIR="$PRISMA_PKG_DIR/node_modules/.prisma/client" && \
        ACTUAL_ENGINE=$(find /app/node_modules -name "libquery_engine-linux-musl-arm64-openssl-3.0.x.so.node" -type f 2>/dev/null | head -1) && \
        if [ -n "$ACTUAL_ENGINE" ] && [ ! -f "$EXPECTED_PRISMA_DIR/libquery_engine-linux-musl-arm64-openssl-3.0.x.so.node" ]; then \
            mkdir -p "$EXPECTED_PRISMA_DIR" && \
            cp -r "$(dirname "$ACTUAL_ENGINE")"/* "$EXPECTED_PRISMA_DIR/"; \
        fi; \
        if [ ! -L "/app/node_modules/@prisma/client" ] && [ ! -d "/app/node_modules/@prisma/client" ]; then \
            mkdir -p /app/node_modules/@prisma && \
            ln -sf "../.pnpm/$(basename "$PRISMA_PKG_DIR")/node_modules/@prisma/client" /app/node_modules/@prisma/client; \
        fi; \
    fi

ENV NODE_PATH=/app/node_modules

CMD [ "node","apps/backend/dist/index.js" ]

