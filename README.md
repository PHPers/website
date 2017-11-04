website
=======

PHPers website

Requirements
====================

You must have
 - [Node.js](https://nodejs.org/en/) - The version should be higher than **4.4.4**.
 - [npm](https://docs.npmjs.com/getting-started/installing-node) - The version should be higher than **2.1.8**.
 - [php intl extension](http://php.net/manual/en/intl.setup.php) - **Intl** php extension is required
 - [sculpin](https://sculpin.io/getstarted/) - You can download sculpin using `curl -O https://download.sculpin.io/sculpin.phar`

If you use docker:
 - Please build image from project root directory `docker build -t php7 .`
 - can add such aliases to your .bash_aliases or .bashrc:
     `alias php='docker run --rm --name php -it -v "$PWD":/usr/src/app -w /usr/src/app php7 php'`
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

Run build and watch gulp task. It download (if needed) dependencies, compile SCSS and do some other stuff.

```bash
$ npm start
```

> If You have Gulp.js installed globally You can use 'gulp' instead

Running
====================

```bash
$ bin/sculpin install --dev
$ bin/sculpin generate --watch --server --port=8080
```

and development server should run at [http://localhost:8080](http://localhost:8080)


Running Tests
==============

```bash
$ php bin/phpunit tests
```

