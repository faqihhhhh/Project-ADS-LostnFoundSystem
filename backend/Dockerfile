# Gunakan image Python yang ringan
FROM python:3.11-slim

# Set working directory di dalam container
WORKDIR /app

# Install system dependencies (diperlukan untuk beberapa package Python)
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements.txt dulu agar bisa memanfaatkan Docker cache
COPY requirements.txt .

# Install dependencies Python
RUN pip install --no-cache-dir -r requirements.txt

# Copy seluruh kode backend ke dalam container
COPY . .

# Expose port yang akan digunakan (Koyeb biasanya mendeteksi port 8000)
EXPOSE 8000

# Perintah untuk menjalankan aplikasi menggunakan Uvicorn
# Gunakan --host 0.0.0.0 agar bisa diakses dari luar container
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
