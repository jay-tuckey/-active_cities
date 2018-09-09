#!/bin/bash

export PATH=/root/.pyenv/plugins/pyenv-virtualenv/shims:/root/.pyenv/shims:/root/.pyenv/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/snap/bin

# Load pyenv automatically by adding
# the following to ~/.bash_profile:

export PATH="/root/.pyenv/bin:$PATH"
eval "$(pyenv init -)"
eval "$(pyenv virtualenv-init -)"

pyenv activate bom

cd /root/active_cities/bom_processor
export FLASK_APP=bom
flask run --host 0.0.0.0 --port 81

