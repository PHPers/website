website
=======

PHPers website

Requirements
====================

You must have
 - [Node.js](https://nodejs.org/en/) - The version should be higher than **4.4.4**.
 - [npm](https://docs.npmjs.com/getting-started/installing-node) - The version should be higher than **2.1.8**.
 - [php](http://php.net) - The version should be >= 5.6 but not 7.0 cause sculpin have problems with 7.0: https://github.com/sculpin/sculpin/issues/297.
 - [php intl extension](http://php.net/manual/en/intl.setup.php) - **Intl** php extension is required
 - [sculpin](https://sculpin.io/getstarted/) - You can download sculpin using `curl -O https://download.sculpin.io/sculpin.phar`

If you use docker:
 - Please build image from project root directory `docker build -t php5 .`
 - can add such aliases to your .bash_aliases or .bashrc:
     `alias php='docker run --rm --name php -it -v "$PWD":/usr/src/app -w /usr/src/app php5 php'`
     `alias npm='docker run --rm --name node -it -v "$PWD":/usr/src/app -w /usr/src/app node:4.4.4 npm'`

Installing
====================

Install dependencies

```bash
$ composer install
```

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
$ bin/sculpin install
$ bin/sculpin generate --watch --server --port=8080
```

and development server should run at [http://localhost:8080](http://localhost:8080)


Running Tests
==============

```bash
sculpin install --dev
php bin/phpunit tests
```

