# Use the official nginx base image
FROM nginx:latest

# Copy the static outptu HTML files to the nginx default directory
COPY dist/ /usr/share/nginx/html

# Expose port 80 for HTTP traffic
EXPOSE 80/tcp
