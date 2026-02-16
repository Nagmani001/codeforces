ARG NODE_VERSION=24.11.0

FROM node:${NODE_VERSION}-slim AS base

FROM base AS prepare 
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune backend --docker

FROM base AS builder 
WORKDIR /app
RUN npm install -g pnpm 
COPY --from=prepare /app/out/json/ .
RUN pnpm install
COPY --from=prepare /app/out/full/ .
RUN cd packages/database && pnpm dlx prisma@6.3.0 generate
RUN pnpm run build

FROM node:${NODE_VERSION}-alpine AS runner
WORKDIR /app

# with this one i get prisma error
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist

# with this one , i get rid of prisma error but then i have get the express error 
# COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
# COPY --from=builder /app/node_modules/.pnpm/@prisma+client@6.3.0_prisma@6.3.0_typescript@5.9.3__typescript@5.9.3/node_modules/.prisma/client/libquery_engine-linux-musl-openssl-3.0.x.so.node ./apps/backend/dist/


CMD [ "node","apps/backend/dist/index.js" ]

