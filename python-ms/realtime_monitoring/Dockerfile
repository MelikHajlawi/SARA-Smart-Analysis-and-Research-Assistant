FROM python:3.11-slim

WORKDIR /app

# 1) Copy & install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 2) Copy your entire code tree under /app
COPY app ./app

EXPOSE 8002

# 3) Launch uvicorn pointing at the module you just copied
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8002"]
