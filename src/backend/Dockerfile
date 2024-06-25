FROM python:3.10.1-slim-bullseye AS build
ENV FLASK_APP=aspen.main
RUN apt-get update && apt-get install -y vim build-essential libdigest-sha-perl wget unzip libdigest-sha-perl
ENV POETRY_VERSION=1.3.2
RUN python3 -m pip install poetry==$POETRY_VERSION
COPY pyproject.toml poetry.lock environment.yaml ./
COPY third-party ./third-party
# Install our customized sqlalchemy-oso package.
RUN wget https://github.com/chanzuckerberg/oso/archive/czge-oso25.zip -O oso.zip && \
    unzip -q oso.zip && \
    mv oso-czge-oso25/languages/python/sqlalchemy-oso sqlalchemy-oso

RUN poetry config virtualenvs.create false && \
    poetry install
# TODO / FIXME
# Oso's core library is a Rust binary that I can't currently compile in Docker on an ARM-based mac
# so for the moment we're installing the upstream oso library (which installs the Rust binaries)
# and then clobbering the python interface with the code from our internal fork. We need to work on
# a better way to build/maintain this module, but we're not there yet.
RUN cp -r oso-czge-oso25/languages/python/oso/oso/* /usr/local/lib/python3.10/site-packages/oso/
RUN cp -r oso-czge-oso25/languages/python/oso/polar/* /usr/local/lib/python3.10/site-packages/polar/

# Separate base image so that we can use it to update the Pipfile.lock and requirements.txt file
FROM python:3.10-slim-bullseye AS base
ENV FLASK_APP=aspen.main
EXPOSE 3000

# Install DB certs.
ADD https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem /usr/local/share/ca-certificates/global-bundle.crt
RUN update-ca-certificates

# Utility
RUN apt-get update && apt-get install -y vim procps wget make jq nano

# Orchestration. Supervisor is heavyweight but afaik nothing else supports sane child reaping and signal forwarding.
RUN pip install --no-cache-dir supervisor

# Proxy/Router: Set up nginx (also install extras to get ngx_http_upstream_fair_module)
RUN apt install -y nginx nginx-extras

# FASTAPI: Install poetry
RUN apt install -y libdigest-sha-perl
ENV POETRY_VERSION=1.3.2
RUN python3 -m pip install poetry==$POETRY_VERSION
WORKDIR /usr/src/app

COPY pyproject.toml poetry.lock environment.yaml ./
# build deps needs to exist before configuring poetry
COPY third-party ./third-party
COPY --from=build sqlalchemy-oso ./sqlalchemy-oso
RUN poetry config virtualenvs.create false
# Copy poetry deps from the build image
COPY --from=build /usr/local/lib/python3.10/site-packages /usr/local/lib/python3.10/site-packages
COPY --from=build \
     /usr/local/bin/gunicorn \
     /usr/local/bin/aws \
     /usr/local/bin/alembic \
     /usr/local/bin/autoflake \
     /usr/local/bin/flake8 \
     /usr/local/bin/black \
     /usr/local/bin/isort \
     /usr/local/bin/mypy \
     /usr/local/bin/pytest \
     /usr/local/bin/

ENV PYTHONPATH=.

COPY . .
# By default, Poetry installs deps, dev deps, and the project package (aspen)
RUN cd aspen && poetry install
# FIXME Should figure out how to fold biopython install into poetry, but poetry
# breaks right now trying to add it to deps.
RUN pip install biopython
CMD ["/usr/local/bin/supervisord", "-c", "/usr/src/app/etc/supervisord.conf"]
