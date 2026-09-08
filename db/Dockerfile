FROM mysql:8.0.36

WORKDIR /app

COPY init.sql /app/init.sql
COPY migrate.sh /app/migrate.sh

# Normalize CRLF line endings for Windows and make script executable
RUN sed -i 's/\r$//' /app/migrate.sh && chmod +x /app/migrate.sh

ENTRYPOINT ["/app/migrate.sh"]
