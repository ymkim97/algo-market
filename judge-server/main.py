from fastapi import FastAPI
from fastapi.responses import JSONResponse

from judge.worker import consume_loop
from contextlib import asynccontextmanager

import uvicorn
import threading
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(_: FastAPI):
    worker_thread = threading.Thread(target=consume_loop, daemon=True)
    worker_thread.start()
    logging.info("SQS worker started in background thread.")
    yield

app = FastAPI(lifespan=lifespan)

@app.get("/health", status_code=200)
async def health_check():
    return {
        "status": "ok",
        "message": "Judge server is running.",
    }

@app.exception_handler(Exception)
async def error_handler(request, exc):
    logger.error(f"Error: {exc}", exc_info=True)

    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error"},
    )

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
