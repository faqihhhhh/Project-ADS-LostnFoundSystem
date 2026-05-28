import os
import uuid
from supabase import create_client, Client
from fastapi import HTTPException

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
BUCKET_NAME = "items" # Pastikan kamu buat bucket bernama 'items' di Supabase Storage

supabase: Client = None
if SUPABASE_URL and SUPABASE_KEY:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def upload_file_to_supabase(file_contents: bytes, filename: str, content_type: str) -> str:
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase Storage belum dikonfigurasi")
    
    # Buat nama file unik
    ext = filename.split(".")[-1]
    unique_filename = f"{uuid.uuid4()}.{ext}"
    
    try:
        # Upload ke bucket 'items'
        res = supabase.storage.from_(BUCKET_NAME).upload(
            path=unique_filename,
            file=file_contents,
            file_options={"content-type": content_type}
        )
        
        # Ambil Public URL
        # Jika bucket bersifat Public, kita bisa buat URL manual atau pakai get_public_url
        public_url = supabase.storage.from_(BUCKET_NAME).get_public_url(unique_filename)
        return public_url
    except Exception as e:
        print(f"Error uploading to Supabase: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Gagal upload ke storage: {str(e)}")
