#!/bin/bash

# Install Node 12.16.1
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.37.2/install.sh | bash
source ~/.nvm/nvm.sh
nvm install 12.16.1

# Install Frontend dependencies
npm --prefix src/ts ci
