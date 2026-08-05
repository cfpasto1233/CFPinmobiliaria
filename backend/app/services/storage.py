import json
import uuid
from pathlib import Path

import boto3
from botocore.exceptions import ClientError
from fastapi import HTTPException, UploadFile

from app.core.config import settings

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB

_client = None
_presign_client = None


def _endpoint_url() -> str:
    if "://" in settings.MINIO_ENDPOINT:
        return settings.MINIO_ENDPOINT
    scheme = "https" if settings.MINIO_SECURE else "http"
    return f"{scheme}://{settings.MINIO_ENDPOINT}"


def _get_client():
    global _client
    if _client is None:
        _client = boto3.client(
            "s3",
            endpoint_url=_endpoint_url(),
            aws_access_key_id=settings.MINIO_ROOT_USER,
            aws_secret_access_key=settings.MINIO_ROOT_PASSWORD,
        )
    return _client


def _get_presign_client():
    # Cliente separado solo para firmar URLs: `_get_client()` apunta a MINIO_ENDPOINT (el
    # hostname interno de Docker, ej. http://minio:9000), inalcanzable desde el navegador.
    # Firmar no hace ninguna llamada de red — solo calcula la firma localmente — así que
    # este cliente nunca necesita conectividad real, solo el endpoint público correcto.
    global _presign_client
    if _presign_client is None:
        _presign_client = boto3.client(
            "s3",
            endpoint_url=settings.MINIO_PUBLIC_URL,
            aws_access_key_id=settings.MINIO_ROOT_USER,
            aws_secret_access_key=settings.MINIO_ROOT_PASSWORD,
        )
    return _presign_client


def _public_read_policy() -> str:
    return json.dumps(
        {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Effect": "Allow",
                    "Principal": "*",
                    "Action": ["s3:GetObject"],
                    "Resource": [
                        f"arn:aws:s3:::{settings.MINIO_BUCKET}/propiedades/*",
                        f"arn:aws:s3:::{settings.MINIO_BUCKET}/proyectos/*",
                    ],
                }
            ],
        }
    )


def ensure_bucket() -> None:
    client = _get_client()
    try:
        client.head_bucket(Bucket=settings.MINIO_BUCKET)
    except ClientError:
        client.create_bucket(Bucket=settings.MINIO_BUCKET)
    # Las fotos de propiedades y proyectos se sirven directo desde el navegador (landing
    # pública), así que esos prefijos necesitan lectura anónima. El resto del bucket
    # sigue privado.
    client.put_bucket_policy(Bucket=settings.MINIO_BUCKET, Policy=_public_read_policy())


def validate_image(upload_file: UploadFile) -> None:
    if upload_file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Formato de imagen no soportado. Usa JPEG, PNG o WEBP.",
        )
    if upload_file.size is not None and upload_file.size > MAX_IMAGE_SIZE_BYTES:
        raise HTTPException(
            status_code=400,
            detail="La imagen supera el tamaño máximo permitido (5 MB).",
        )


def upload_image(upload_file: UploadFile, *, folder: str) -> str:
    ensure_bucket()
    ext = Path(upload_file.filename or "").suffix or ".jpg"
    key = f"{folder}/{uuid.uuid4()}{ext}"
    _get_client().upload_fileobj(
        upload_file.file,
        settings.MINIO_BUCKET,
        key,
        ExtraArgs={"ContentType": upload_file.content_type},
    )
    return key


def delete_object(key: str) -> None:
    try:
        _get_client().delete_object(Bucket=settings.MINIO_BUCKET, Key=key)
    except ClientError:
        pass


def public_url(key: str) -> str:
    return f"{settings.MINIO_PUBLIC_URL}/{settings.MINIO_BUCKET}/{key}"


def presigned_url(key: str, *, expires_in: int = 3600) -> str:
    return _get_presign_client().generate_presigned_url(
        "get_object",
        Params={"Bucket": settings.MINIO_BUCKET, "Key": key},
        ExpiresIn=expires_in,
    )
