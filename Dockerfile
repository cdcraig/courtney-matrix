FROM oven/bun:1
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
# bust cache v3
RUN bun run build
EXPOSE 3456
CMD ["bun", "run", "server.ts"]
