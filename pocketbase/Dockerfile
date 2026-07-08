FROM alpine:3.18

# Install dependencies (ca-certificates for external API calls, unzip for release zip, wget)
RUN apk add --no-cache ca-certificates unzip wget libstdc++ libgcc

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

# Expose default PocketBase HTTP port
EXPOSE 8080

# Start server targeting persistent volume storage directory
CMD ["/pb/pocketbase", "serve", "--http=0.0.0.0:8080", "--dir=/pb/pb_data"]
