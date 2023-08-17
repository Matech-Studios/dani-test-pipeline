[![Memento API - Continuous Integration](https://github.com/Matech-Studios/matech-memento-api/actions/workflows/continuous-integration.yml/badge.svg)](https://github.com/Matech-Studios/matech-memento-api/actions/workflows/continuous-integration.yml)

## IMPORTANT : known Issue

Always delete dist/ and temp/ folder when something is not working and rebuild.

## Description

API for the Memento project. Highlights:

-   Nest
-   Swagger
-   MikroORM
-   Postgress connection
-   Firebase as User Manager

## Node supported version

### 18.x

---

## Installation

```bash
$ yarn
```

## Enviroment variables

```
This application uses Firebase that needs its configuration extracted from a .env file
```

## ESLint
### Code Quality - ESLint

ESLint is a vital tool used in this TypeScript project to ensure code quality and maintainability. It performs static analysis to identify problematic patterns and enforce coding standards. Key points about our ESLint configuration include:

- Customized rules for formatting, environment setup, and TypeScript-specific linting.
- Integration of Prettier for consistent code formatting.
- Rules customized to handle unused variables, prefer 'const,' and more.
By running ESLint before committing changes, we ensure a high-quality, uniform codebase and minimize production errors.

Troubleshooting ESLint
If ESLint is not functioning correctly, it may be due to missing or incorrectly installed dependencies. Ensure you have installed the required dependencies, including ESLint and its plugins, by running yarn in the project's root directory. If issues persist, review the ESLint configuration file or seek help from project maintainers or your team.

## Running the app

```bash
# development
$ yarn start

# watch mode
$ yarn start:dev

# production mode
$ yarn start:prod
```

## Test

```bash
# unit tests
$ yarn test
```

## Docker support

```
docker build -t matech-memento-api .
docker run -d -p 3001:3001 --env-file=.env --name matech-memento-api matech-memento-api
```

Or if you prefer to run everything together including the DB

```
docker compose up --build -d
```

## Logging support

The `CustomLogger` is responsible for everything related to logging. It is
injected as part of the application in `main.ts` and as a provider in
`app.module.ts` . This allows the use of the same logger accross the entire
application, giving the advantage to use a Trace ID ( `x-request-id` ) for
example, in order to track the flow of a request.

### Usage

Example of `auth.controller.ts` :

-   Add `CustomLogger` in the _providers_ of the `auth.module.ts`.

```typescript
@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private logger: CustomLogger
    ) {}

    @Post('signin')
    async signIn(@Body() user: SignInRequest) {
        this.logger.log('signIn method', AuthController.name);

        return await this.authService.signIn(user);
    }
}
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors
and support by the amazing backers. If you'd like to join them, please
[read more here](https://docs.nestjs.com/support).

## License

Nest is [MIT licensed](LICENSE).

# Swagger

http://localhost:5001/swagger https://docs.nestjs.com/openapi/introduction

# Running migrations

This project uses migrations to manage DB changes. Run the following commands to
spin up a DB with migrations:

-   To create a migration make the changes in the code (Entity for example
    Raffles.dto.ts) then:

```
yarn migration:create
```

-   To upload this migration to a DB:

```
yarn migration:up
```

-   To Generate data to test raffles:

```
yarn generate:testdata
```

And then change the CreatedBy field in all the tables to your user. This will
generate events, raffles, collectibles, and all the data related to be able to
run a raffle.

The migrations folder is in `rootDir/src/core/database/migrations`

This folder can be deleted if a clean migration wants to be runned.
