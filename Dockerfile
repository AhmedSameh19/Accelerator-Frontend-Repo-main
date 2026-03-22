# Coolify-optimized (avoids build timeouts): serve prebuilt CRA `build/`.
# IMPORTANT: run `npm run build` locally/CI and commit the `build/` folder.

FROM node:18-alpine
WORKDIR /app

RUN npm install -g serve

COPY build ./build
RUN test -f ./build/index.html

ENV PORT=80
EXPOSE 80
CMD ["sh", "-c", "serve -s build -l tcp://0.0.0.0:${PORT:-80}"]
