FROM node:14.21.3-buster-slim AS base
WORKDIR /usr/src/app
RUN chown node:node /usr/src/app
ENV NODE_ENV=development
ENV BUILD_PATH=build
ENV PATH /usr/src/app/node_modules/.bin:$PATH
RUN apt-get update && apt-get install -y make wget \
  gconf-service gettext-base libasound2 libatk1.0-0 libatk-bridge2.0-0 libc6 \
  libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 \
  libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 \
  libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 \
  libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 \
  libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 \
  lsb-release xdg-utils nano vim procps \
  && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
USER node
RUN npm ci --verbose --no-optional && npm cache clean --force
COPY . .
ENTRYPOINT ["./entrypoint.sh"]
ARG HAPPY_COMMIT="unknown"
ENV COMMIT_SHA=${HAPPY_COMMIT}
