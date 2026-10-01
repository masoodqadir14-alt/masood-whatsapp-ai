FROM node:20-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
    fonts-liberation \
    ca-certificates \
    xvfb \
    xauth \
    && rm -rf /var/lib/apt/lists/* \
    && mkdir -p /tmp/.X11-unix \
    && chmod 1777 /tmp/.X11-unix

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV PORT=8080

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY whatsapp-ai.js ./

RUN mkdir -p /app/.wwebjs_auth /app/.wwebjs_cache && \
    chown -R 1000:1000 /app

USER 1000:1000

EXPOSE 8080

CMD ["xvfb-run", "-a", "node", "whatsapp-ai.js"]