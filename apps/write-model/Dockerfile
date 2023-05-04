FROM node:alpine AS pruner
RUN apk add --no-cache libc6-compat
RUN apk update
WORKDIR /app
RUN npm install -g pnpm
RUN npm install -g turbo
COPY . .
RUN turbo prune --scope=write-model --docker

FROM node:alpine AS builder
RUN apk add --no-cache libc6-compat
RUN apk update
WORKDIR /app
RUN npm install -g pnpm
RUN npm install -g turbo
# First install the dependencies (as they change less often)
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install
# Build the project
COPY --from=pruner /app/out/full/ .
COPY turbo.json turbo.json
RUN turbo run build --filter=write-model...

FROM node:alpine AS runner
WORKDIR /app

COPY --from=builder /app .
CMD node apps/write-model/dist/main.js