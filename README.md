## Description
This is the LessonsQueue project's API repository. The project is being developed to facilitate the process of passing laboratory work by university students.
This API provides students with the ability to efficiently manage their lab assignment queue. 
The application provides the ability to create the queue, add students to the queue, move and remove them from it, as well as mark the completion of tasks, etc...

**Our tech stack**: Nest.js and Prisma (with PostgreSQL as DBMS)

**Design Document**: For more understanding of this project you can visit our [Design Document](https://docs.google.com/document/d/1VQChDcqtpMh4TreQL61J6O9NR8FkwoBUx1zo6jvGuPg/edit)

## Our developers
This project is being made by:
* [Danyil Tymofeiev](https://github.com/SharpDevOps10)
* [Bogdan Yarmolka](https://github.com/thebladehit)
* [Anton Dovzhenko](https://github.com/KobbAsa)
* [Nazarii Radichenko](https://github.com/radichenko)

## Installation
* First and foremost, you need to make sure that you have installed [Node.js](https://nodejs.org/en)

* After that, you have to clone this repository and enter the working folder:
```bash
$ git clone https://github.com/LessonsQueue/QueueManagerApi.git
$ cd QueueManagerApi
```
* Then you have to install the dependencies for this project:
```bash
$ npm install
```

## Running the app
In order to run this project you have to write one of these commands:
* In development mode: 
```bash
# development
$ npm run start
```
* In watch mode: 
```bash
# watch mode
$ npm run start:dev
```
* In production mode:
```bash
# production mode
$ npm run start:prod
```
## Tests
The tests are located in the same folder as the `services` and are marked as `.spec.ts`. If you want to run our tests locally, you should:
* Start PostgreSQL Database for testing using [docker compose](https://docs.docker.com/compose/install/):
```bash
$ docker-compose up
```
* Apply all migrations to your testing Database:
```bash
$ npm run test:migrate
```
* And run all integration tests:
```bash
$ npm run test:integration
```

## Building
If you want to build our project you have to write this command:
```bash
$ npm run build
```
Or you can use our [Dockerfile](https://github.com/LessonsQueue/QueueManagerApi/blob/main/Dockerfile) to build the project (how to build the image of our app, visit the `Dockerization` sections of README)

## Migrations
If you want to use our logic you have to use your prepared Database (with PostgreSQL as DBMS) and add it to your `.env`.
You can see the example of your `.env` file here [.env.example](https://github.com/LessonsQueue/QueueManagerApi/blob/main/.env.example).
Afterwards, you should apply all migrations to your Database:
```bash
$ npx prisma migrate dev
```

## Continuous Integration
We have also added CI using `GitHub Actions` (located in `.github` folder) for checking the build and running integration tests. 
Here you can find our [All Workflows](https://github.com/LessonsQueue/QueueManagerApi/actions)

## Dockerization
If you want to build our image, you should write these commands:
```bash
$ sudo docker build -t nest:latest .
```
After that: 
```bash
$ sudo docker run -p 3000:3000 --env-file .env nest:latest
```

You can also get the latest version of our image from [DockerHub repository](https://hub.docker.com/repository/docker/rerorerio8/queue-manager/general): 
```bash
$ docker pull rerorerio8/queue-manager:latest 
```