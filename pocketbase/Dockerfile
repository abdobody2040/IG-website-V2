FROM alpine:3.18

# Install dependencies (ca-certificates for external API calls, unzip for release zip, wget, sqlite3 for backups)
RUN apk add --no-cache ca-certificates unzip wget libstdc++ libgcc sqlite3

# Set PocketBase version matching local development version
ENV PB_VERSION=0.22.22

# Download and extract the official Linux AMD64 PocketBase binary
RUN wget https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip \
    && unzip pocketbase_${PB_VERSION}_linux_amd64.zip -d /pb \
    && rm pocketbase_${PB_VERSION}_linux_amd64.zip

# Create empty directories for database volume and application assets
RUN mkdir -p /pb/pb_data /pb/pb_migrations /pb/pb_hooks /pb/pb_public

# Copy local schema, hooks and migration scripts
COPY ./pb_schema.json /pb/pb_schema.json
COPY ./pb_migrations /pb/pb_migrations
COPY ./pb_hooks /pb/pb_hooks

# Copy and make executable the secure startup wrapper and backup script
COPY ./start.sh /pb/start.sh
COPY ./backup.sh /pb/backup.sh
RUN chmod +x /pb/start.sh /pb/backup.sh

# Expose only the public-facing HTTP port.
# The admin panel listener (127.0.0.1:8090) is NOT exposed — it is internal only.
EXPOSE 8080

# Use startup wrapper for secure launch with encryption-at-rest support
CMD ["/pb/start.sh"]
