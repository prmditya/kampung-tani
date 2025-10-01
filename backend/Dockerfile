# Flask Dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt && pip install supervisor
COPY . .
EXPOSE 5000
CMD ["supervisord", "-c", "/app/supervisord.conf"]
