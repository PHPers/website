website
=======

PHPers website

Requirements
====================

You must have
 - [Node.js](https://nodejs.org/en/) - The version should be higher than **4.4.4**.
 - [npm](https://docs.npmjs.com/getting-started/installing-node) - The version should be higher than **2.1.8**.
 - [php intl extension](http://php.net/manual/en/intl.setup.php) - **Intl** php extension is required

If you use docker and docker-compose:
 - Please copy `docker-compose.yml.dist` into `docker-compose.yml`
 - Run `docker-compose up -d`

Installing
====================

Install dependencies

```bash
$ composer install
```

```bash
$ npm install
```

Run build and watch webpack server. It compile SCSS and do some other stuff.

```bash
$ npm start
```

Running
====================

```bash
$ bin/sculpin generate --watch --server --port=8080
```

and development server should run at [http://localhost:8080](http://localhost:8080)


Running Tests
==============

```bash
$ php bin/phpunit tests
```
