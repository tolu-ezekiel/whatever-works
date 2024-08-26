# Whatever.works user management service

This is a backend service to managing user registration, authentication, and profile management using Node.js and NestJS

## Tools:
- Typescript
- NodeJs
- NestJs
- PostgreSQL
- Prisma
- Docker
- JWT
- Jest
- testcontainers
- Open API documentation


## Installation and Usage

### Requirement
Docker and Node.Js

### Env variables
All values in the `.env` file can be changed to your prefered values.
```
PORT=3000
LOG_LEVEL=info
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
DB_HOST=postgres
DB_PORT=5432
POSTGRES_DB=whatever-dev
DATABASE_URL=postgresql://postgres:password@postgres:5432/whatever-dev
JWT_SECRET=8R1zaHiWywZbpU1
```

### Run the application
To start this service run the command below.

This will start the Docker container, install the dependencies and start the server.
```sh
npm  run  docker:build:up
```

### URL
Localhost: http://localhost:3000

### API Specification / documentation
Visit http://localhost:3000/api for Swagger API documentation

### Protected Features
Yo need to provide  `Bearer ${accessToken}` in the `Authorization header` for all protected endpoints.


## Tests
`@testcontainers/postgresql` is used to ochestrate the test database so Docker is required for running the e2e tests.

To run the test suit run the commands below.

```sh
npm  install
```

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

