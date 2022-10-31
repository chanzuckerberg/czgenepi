#!/bin/bash


# install latest version of nextclade
curl -fsSL "https://github.com/nextstrain/nextclade/releases/latest/download/nextclade-x86_64-unknown-linux-gnu" -o "nextclade" && chmod +x nextclade

# test nextclade installed
nextclade --version