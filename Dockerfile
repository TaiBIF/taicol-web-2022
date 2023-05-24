ARG PYTHON_VERSION=3.10

FROM python:${PYTHON_VERSION}-slim-buster AS builder

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

RUN apt-get update \
  # dependencies for building Python packages
  && apt-get install -y build-essential \
  # tools
  && apt-get install -y curl \
  # django i18n
  && apt-get install -y gettext \
  # psycopg2 dependencies
  # && apt-get install -y libpq-dev \
  # Translations dependencies
  #&& apt-get install -y gettext \
  # cleaning up unused files
  && apt-get purge -y --auto-remove -o APT::AutoRemove::RecommendsImportant=false \
  && rm -rf /var/lib/apt/lists/*

# timezone to Asia/Taipei
RUN ln -sf /usr/share/zoneinfo/Asia/Taipei /etc/localtime
RUN echo "Asia/Taipei" > /etc/timezone
ENV TZ=Asia/Taipei

WORKDIR /code

# Install Poetry
RUN curl -sSL https://install.python-poetry.org| POETRY_HOME=/opt/poetry python && \
    cd /usr/local/bin && \
    ln -s /opt/poetry/bin/poetry && \
    poetry config virtualenvs.create false

# Copy using poetry.lock* in case it doesn't exist yet
COPY ./pyproject.toml ./poetry.lock* /code/

RUN poetry install --no-root --no-dev


# # Package
# COPY requirements requirements
# RUN pip install --upgrade pip
# RUN pip install --no-cache --user -r requirements/base.txt

COPY ./scripts/entrypoint /srv/entrypoint
RUN sed -i 's/\r$//g' /srv/entrypoint
RUN chmod +x /srv/entrypoint

COPY ./scripts/start /srv/start
RUN sed -i 's/\r$//g' /srv/start
RUN chmod +x /srv/start

ENTRYPOINT ["/srv/entrypoint"]