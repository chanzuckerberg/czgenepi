#!/bin/bash
set -x

export NVM_DIR="${HOME}/.nvm"
export NODE_VERSION="12.16.1"

# Install Node 12.16.1
if [[ ! -f "${NVM_DIR}/nvm.sh" ]]; then
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.37.2/install.sh | bash
fi

source "${NVM_DIR}/nvm.sh"

if [[ $(nvm current) != "v${NODE_VERSION}" ]]; then
    nvm install ${NODE_VERSION}
fi

# Install Frontend dependencies
npm --prefix src/ts ci
