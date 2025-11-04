FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code
COPY ./app /app/app

# Set PYTHONPATH so FastAPI can find 'app'
ENV PYTHONPATH=/app

# Run database initialization automatically
CMD ["bash", "-c", "python app/init_db.py && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"]
