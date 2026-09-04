FROM eclipse-temurin:21-jdk AS builder

WORKDIR /app

RUN apt-get update \
    && apt-get install -y curl gzip \
    && rm -rf /var/lib/apt/lists/*

RUN curl -fL https://github.com/coursier/launchers/raw/master/cs-x86_64-pc-linux.gz -o /tmp/cs.gz \
    && gzip -d /tmp/cs.gz \
    && chmod +x /tmp/cs \
    && mv /tmp/cs /usr/local/bin/cs \
    && cs install sbt --install-dir /usr/local/bin

COPY . .

RUN sbt clean stage

FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=builder /app/target/universal/stage ./stage

CMD ["sh", "-c", "./stage/bin/play-scala-seed -Dhttp.port=${PORT:-9000} -Dplay.http.secret.key=${PLAY_HTTP_SECRET_KEY}"]