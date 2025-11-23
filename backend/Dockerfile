FROM python:3.11-slim-bookworm

WORKDIR /app

# Install dependencies
# We rely on binary wheels for psycopg2, bcrypt, and cryptography to avoid compiling
# and to save memory/time during build.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code
COPY ./app /app/app

# Set PYTHONPATH so FastAPI can find 'app'
ENV PYTHONPATH=/app

# Run database initialization automatically and then start the server
CMD ["bash", "-c", "python app/initial_data.py && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"]
