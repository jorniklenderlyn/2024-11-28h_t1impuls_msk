from fastapi import FastAPI, File, UploadFile, HTTPException
from pydantic import BaseModel, HttpUrl
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from motor.motor_asyncio import AsyncIOMotorClient
from fastapi.middleware.cors import CORSMiddleware
import os
import logging
import dotenv
from typing import Optional


dotenv.load_dotenv()

logging.basicConfig(filename="log.log")

from parsers import FileParser, UrlParser
from models import LocalModelHandler, ModelConfig


@asynccontextmanager
async def lifespan(cur_app: FastAPI):
    db_client = AsyncIOMotorClient(
        f"mongodb+srv://{os.environ['MONGO_USER']}:{os.environ['MONGO_PASSWORD']}@{os.environ['MONGO_HOST']}/")
    text_db = db_client.text
    text_collection = text_db.text
    cur_app.state.text_collection = text_collection
    cur_app.state.documents = {}

    async for doc in text_collection.find():
        if doc["id"] not in cur_app.state.documents:
            cur_app.state.documents[doc["id"]] = []
        cur_app.state.documents[doc["id"]].append(doc["text"])
    cur_app.state.model_handler = LocalModelHandler(config=ModelConfig())
    yield


app = FastAPI(lifespan=lifespan) 

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)


@app.post("/{user_id}/upload/")
async def upload_file(user_id: int, file: UploadFile = File(...)):
    try:
        text = FileParser.parse(file.filename, await file.read())
        await app.state.text_collection.insert_one({"text": text, "id": user_id})
        if user_id not in app.state.documents:
            app.state.documents[user_id] = []
        app.state.documents[user_id].append(text)

        return JSONResponse(content={"detail": "success"}, status_code=200)
    except Exception as e:
        logging.exception('Got exception on upload handler')
        raise (HTTPException(status_code=500, detail="Unsupported file format"))


class URLRequest(BaseModel):
    url: HttpUrl


@app.post("/{user_id}/url/")
async def upload_url(user_id: int, request: URLRequest):
    try:
        parser = UrlParser()
        text = await parser.parse(str(request.url))
        await app.state.text_collection.insert_one({"text": text, "id": user_id})
        if user_id not in app.state.documents:
            app.state.documents[user_id] = []
        app.state.documents[user_id].append(text)

        return JSONResponse(content={"detail": "success"}, status_code=200)
    except Exception as e:
        logging.exception('Got exception on url handler')
        raise HTTPException(status_code=500, detail="Unsupported url")


class ChatRequest(BaseModel):
    message: str  # Сообщение пользователя
    model_name: str  # Имя модели
    chat_history: list[dict[str, str]]  # История чата
    prompt: Optional[str] = None

# Обработчик POST запроса для чата
@app.post("/{user_id}/chat/")
async def chat(user_id: int, request: ChatRequest):
    # Получаем сообщение пользователя и историю чата
    user_message = request.message
    chat_history = request.chat_history
    model_name = request.model_name
    prompt = request.prompt

    try:
        # Генерация ответа с использованием выбранной модели
        response = generate_response(user_id, user_message, chat_history, model_name, prompt)
        print(response)
        # Возвращаем ответ и обновленную историю чата
        return {"response": response, "chat_history": chat_history}

    except Exception as e:
        # Обрабатываем ошибки и отправляем их как HTTPException
        raise HTTPException(status_code=500, detail=f"Ошибка: {str(e)}")

# Функция для генерации ответа от модели
def generate_response(user_id, user_message, chat_history, model_name):
    # Логика для генерации ответа с использованием выбранной модели
    try:
        supported_models = ["Qwen/Qwen2.5-0.5B-Instruct",'Qwen/Qwen2.5-7B-Instruct','Qwen/Qwen2.5-3B-Instruct','Qwen/Qwen2.5-14B-Instruct','Qwen/Qwen2.5-32B-Instruct',"google/gemma-2-2b-it",'google/gemma-2-9b-it','google/gemma-2-27b-it','ai-forever/ruGPT-3.5-13B','Vikhrmodels/Vikhr-Nemo-12B-Instruct-R-21-09-24','IlyaGusev/saiga_llama3_8b']

        # Проверка на наличие модели в списке поддерживаемых моделей
        if model_name in supported_models:
            return app.state.model_handler.chat(app.state.documents.get(user_id, []), user_message, model_name, chat_history)
        else:
            raise ValueError(f"Модель {model_name} не поддерживается")
    except Exception as e:
        raise ValueError(f"Ошибка при генерации ответа с моделью {model_name}: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
