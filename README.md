website
=======

[PHPers website](https://phpers.pl/)

Running using docker
====================

You can run watcher server using docker. To do this, you can use provided Makefile, which 
has following commands:
* `make composer-update` - runs `composer update` command (to be used only after dependency modifications)
* `make composer` - downloads composer dependencies
* `make build` - builds static HTML docs
* `make serve` - builds, watches for changes, and serves the website on port 8000
