ARG NODE_VERSION=24.11.0

FROM node:${NODE_VERSION}-slim AS base

FROM base as prepare 
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune web --docker

FROM base as builder 
WORKDIR /app
RUN npm install -g pnpm 
COPY --from=prepare /app/out/json/ . 
RUN pnpm install 
COPY --from=prepare /app/out/full/ . 
RUN pnpm run build

FROM base as runner
WORKDIR /app
COPY --from=builder /app . 

CMD [ "npm","run","start:web" ]
