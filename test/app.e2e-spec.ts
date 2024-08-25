import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';
import { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { startPostgresContainer } from './testcontainers/postgres-container';
import { runPrismaMigrations } from './testcontainers/prisma-migrate';

describe('AppController (e2e)', () => {
  jest.setTimeout(100000);

  let app: INestApplication;
  let prismaService: PrismaService;
  let postgresContainer: StartedPostgreSqlContainer;

  beforeAll(async () => {
    postgresContainer = await startPostgresContainer();

    const host = postgresContainer.getHost();
    const port = postgresContainer.getPort();
    const database = postgresContainer.getDatabase();
    const username = postgresContainer.getUsername();
    const password = postgresContainer.getPassword();
    process.env.DATABASE_URL = `postgresql://${username}:${password}@${host}:${port}/${database}`;

    await runPrismaMigrations();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    prismaService = app.get(PrismaService);
  });

  afterAll(async () => {
    await prismaService.$disconnect();
    await app.close();
    await postgresContainer.stop();
  });

  describe('Auth & Users (e2e)', () => {
    let accessToken: string;
    let refreshToken: string;
    let id: number;

    it('/auth/signup (POST) - should register a new user', () => {
      return request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          username: 'testuser',
          password: 'Password123!',
        })
        .expect(201)
        .then((response) => {
          expect(response.body.accessToken).toBeDefined();
          expect(response.body.refreshToken).toBeDefined();
          expect(response.body.user).toBeDefined();
          expect(response.body.user.username).toEqual('testuser');
          accessToken = response.body.accessToken;
          refreshToken = response.body.refreshToken;
          id = response.body.user.id;
        });
    });

    it('/auth/login (POST) - should log in the user', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'testuser',
          password: 'Password123!',
        })
        .expect(200)
        .then((response) => {
          expect(response.body.accessToken).toBeDefined();
          expect(response.body.refreshToken).toBeDefined();
          expect(response.body.user.username).toEqual('testuser');
          accessToken = response.body.accessToken;
          refreshToken = response.body.refreshToken;
          id = response.body?.user?.id;
        });
    });

    it('/users/:id (GET) - should get the user profile by ID', () => {
      return request(app.getHttpServer())
        .get(`/users/${id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .then((response) => {
          expect(response.body.id).toEqual(id);
          expect(response.body.username).toEqual('testuser');
          expect(response.body.password).toBeUndefined();
        });
    });

    it('/users (GET) - should find the user by username', () => {
      return request(app.getHttpServer())
        .get('/users')
        .query({ username: 'testuser' })
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .then((response) => {
          expect(response.body).toBeDefined();
          expect(response.body.username).toEqual('testuser');
          expect(response.body.password).toBeUndefined();
        });
    });

    it('/users/:id (PUT) - should update the username', () => {
      return request(app.getHttpServer())
        .put(`/users/${id}/username`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          username: 'updateduser',
        })
        .expect(200)
        .then((response) => {
          expect(response.body.user.username).toEqual('updateduser');
          accessToken = response.body.accessToken;
          refreshToken = response.body.refreshToken;
        });
    });

    it('/auth/reset-password (POST) - should reset the user password', () => {
      return request(app.getHttpServer())
        .post('/auth/reset-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          oldPassword: 'Password123!',
          newPassword: 'NewPassword123!',
        })
        .expect(201)
        .then((response) => {
          expect(response.body.accessToken).toBeDefined();
          expect(response.body.refreshToken).toBeDefined();
          accessToken = response.body.accessToken;
          refreshToken = response.body.refreshToken;
        });
    });

    it('/auth/new-access-token (POST) - should generate a new access token', () => {
      return request(app.getHttpServer())
        .post('/auth/new-access-token')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ refreshToken })
        .expect(200)
        .then((response) => {
          expect(response.body.accessToken).toBeDefined();
          refreshToken = response.body.refreshToken;
        });
    });

    it('/auth/logout (POST) - should log out the user', () => {
      return request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .then((response) => {
          expect(response.body.message).toEqual('Logged out successfully');
        });
    });

    it('/auth/login (POST) - should not log in with old credentials after password reset', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'updateduser',
          password: 'Password123!',
        })
        .expect(401);
    });

    it('/auth/login (POST) - should log in with the new password', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'updateduser',
          password: 'NewPassword123!',
        })
        .expect(200)
        .then((response) => {
          expect(response.body.accessToken).toBeDefined();
          expect(response.body.refreshToken).toBeDefined();
        });
    });
  });
});
