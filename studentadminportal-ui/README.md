# StudentadminportalUi

This project uses Angular and Angular CLI 22.2.3.

## Prerequisites

- Node.js 22.22.3 or later in the 22.x line, or 24.15.0 or later in the 24.x line
- npm (included with Node.js)

## Run locally

From this directory, install dependencies and start the development server:

```sh
npm ci
npm start
```

Open `http://localhost:4200/`. The app also expects its backend API at `http://localhost:7255/`.

## Build and test

```sh
npm run build
npm test
npm run test:ci -- --coverage
```

Vitest runs in jsdom, so the tests do not require launching a browser. `npm test` runs in watch mode; use `npm run test:ci` for a single, non-watch run.
The coverage command uses the Vitest v8 provider and writes an HTML report to `coverage/studentadminportal-ui/index.html`.

Production build output is written to `dist/studentadminportal-ui/browser/`.
