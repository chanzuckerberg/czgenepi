if [ ! -f server.crt ]; then
  openssl req -x509 -newkey rsa:4096 -sha256 -days 3560 -nodes -keyout server.key -out server.crt -subj '/CN=oidc.genepinet.local' -extensions san -nodes -config <( \
    echo '[req]'; \
    echo 'distinguished_name=req'; \
    echo '[san]'; \
    echo 'subjectAltName=DNS:oidc')
else
    echo "Cert already exists, skipping"
fi
