###################
# PRODUCTION
###################

FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy application dependency manifests to the container image.
# A wildcard is used to ensure copying both package.json AND package-lock.json (when available).
# Copying this first prevents re-running npm install on every code change.
COPY --chown=node:node package.json ./
COPY --chown=node:node yarn.lock ./

RUN apk update && apk add bash

RUN yarn

# In order to run `yarn build` we need access to the Nest CLI which is a dev dependency. In the previous development stage we ran `yarn` which installed all dependencies, so we can copy over the node_modules directory from the development image
COPY --chown=node:node . .

COPY --chown=node:node ./src/core/database/mikro-orm.config.ts ./mikro-orm.config.ts

RUN yarn build

CMD ["yarn", "migration:up"]