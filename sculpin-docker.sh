#!/bin/bash

docker run -it --rm -p 8000:8000 -v $(pwd):/data -u `id -u` clue/sculpin $@
