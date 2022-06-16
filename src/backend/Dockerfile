FROM python:3.9.1-slim AS build
ENV FLASK_APP=aspen.main
RUN apt-get update && apt-get install -y vim build-essential libdigest-sha-perl wget unzip libdigest-sha-perl
ENV POETRY_HOME /opt/poetry/
RUN wget https://raw.githubusercontent.com/python-poetry/poetry/1.1.10/get-poetry.py && \
    echo "e973b3badb95a916bfe250c22eeb7253130fd87312afa326eb02b8bdcea8f4a7  get-poetry.py" > get-poetry.py.sha256 && \
    shasum -a 256 -c get-poetry.py.sha256 && \
    python get-poetry.py && \
    rm get-poetry*
COPY pyproject.toml poetry.lock environment.yaml ./
COPY third-party ./third-party
# Install our customized sqlalchemy-oso package.
RUN wget https://github.com/chanzuckerberg/oso/archive/czge-oso25.zip -O oso.zip && \
    unzip oso.zip && \
    mv oso-czge-oso25/languages/python/sqlalchemy-oso sqlalchemy-oso
RUN /opt/poetry/bin/poetry config virtualenvs.create false && \
    /opt/poetry/bin/poetry install
# TODO - HAAAACKSSSS
RUN cp -r oso-czge-oso25/languages/python/oso/oso/* /usr/local/lib/python3.9/site-packages/oso/
RUN cp -r oso-czge-oso25/languages/python/oso/polar/* /usr/local/lib/python3.9/site-packages/polar/

# Separate base image so that we can use it to update the Pipfile.lock and requirements.txt file
FROM python:3.9.1-slim AS base
ENV FLASK_APP=aspen.main
EXPOSE 3000

# Utility
RUN apt-get update && apt-get install -y vim procps wget make jq nano

# Orchestration. Supervisor is heavyweight but afaik nothing else supports sane child reaping and signal forwarding.
RUN pip install --no-cache-dir supervisor

# Proxy/Router: Set up nginx
RUN apt install -y nginx

# FASTAPI: Install poetry
ENV POETRY_HOME /opt/poetry/
RUN apt install -y libdigest-sha-perl
RUN wget https://raw.githubusercontent.com/python-poetry/poetry/1.1.10/get-poetry.py && \
    echo "e973b3badb95a916bfe250c22eeb7253130fd87312afa326eb02b8bdcea8f4a7  get-poetry.py" > get-poetry.py.sha256 && \
    shasum -a 256 -c get-poetry.py.sha256 && \
    python get-poetry.py && \
    rm get-poetry*
WORKDIR /usr/src/app

COPY pyproject.toml poetry.lock environment.yaml ./
# build deps needs to exist before configuring poetry
COPY third-party ./third-party
COPY --from=build sqlalchemy-oso ./sqlalchemy-oso
RUN /opt/poetry/bin/poetry config virtualenvs.create false
# Copy poetry deps from the build image
COPY --from=build /usr/local/lib/python3.9/site-packages /usr/local/lib/python3.9/site-packages
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
RUN cd aspen && /opt/poetry/bin/poetry install
CMD ["/usr/local/bin/supervisord", "-c", "/usr/src/app/etc/supervisord.conf"]
