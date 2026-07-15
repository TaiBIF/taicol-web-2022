ARG PYTHON_VERSION=3.12

FROM python:${PYTHON_VERSION}-slim-bookworm AS builder

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

COPY ./requirements.txt /code/
RUN pip install --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

COPY ./scripts/entrypoint /srv/entrypoint
RUN sed -i 's/\r$//g' /srv/entrypoint
RUN chmod +x /srv/entrypoint

COPY ./scripts/start /srv/start
RUN sed -i 's/\r$//g' /srv/start
RUN chmod +x /srv/start

ENTRYPOINT ["/srv/entrypoint"]