FROM python:3.11-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
RUN apt-get update && apt-get install -y --no-install-recommends     binutils libproj-dev gdal-bin postgresql-client && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["bash","-lc","python manage.py collectstatic --noinput || true && gunicorn spazaafy_backend.asgi:application -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000"]
