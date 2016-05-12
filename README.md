website
=======

PHPers website

Requirements
====================

You must have
 - [Node.js](https://nodejs.org/en/) - The version should be higher than **0.10.32**.
 - [npm](https://docs.npmjs.com/getting-started/installing-node) - The version should be higher than **2.1.8**.

Installing
====================

Install dependencies

```bash
$ npm run dependencies
```

Run default gulp task. It download (if needed) dependencies, compile SCSS and do some other stuff.
Last task run sass:watch

```bash
$ npm run gulp
```

> If You have Gulp.js installed globally You can use 'gulp' instead

Running
====================

```bash
sculpin generate --watch --server --port=8080
```

and development server should run at [http://localhost:8080](http://localhost:8080)


Running using docker
====================

You can run watcher server using docker by: `./sculpin-docker.sh generate --watch --server` (sudo may be required)

