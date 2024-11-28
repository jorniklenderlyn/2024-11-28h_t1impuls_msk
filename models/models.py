import os
from transformers import pipeline, AutoTokenizer, AutoModelForCausalLM
from sentence_transformers import SentenceTransformer
import faiss
import numpy as np
from models.utils import split_into_chunks, search_documents
from models.config import ModelConfig

models = {}


class LocalModelHandler:
    def __init__(self, config: ModelConfig):
        self.config = config

    def load_model(self, model_name: str):
        """Загружаем модель только если она не была загружена."""
        global models

        # Если модель уже загружена, используем ее
        if model_name in models:
            return models[model_name]

        try:
            # Загружаем Sentence-BERT для эмбеддингов
            embedder = SentenceTransformer(self.config.embedder_model_name)

            # Загружаем генератор (например, GPT-2)
            generator_tokenizer = AutoTokenizer.from_pretrained(model_name)
            generator_model = AutoModelForCausalLM.from_pretrained(model_name)

            # Сохраняем модели в глобальный словарь
            models[model_name] = {
                "embedder": embedder,
                "generator_model": generator_model,
                "generator_tokenizer": generator_tokenizer
            }
            return models[model_name]

        except Exception as e:
            raise Exception(f"Ошибка при загрузке модели '{model_name}': {str(e)}")

    def format_chat_history(self, chat_history):
        """Форматируем историю чата в удобный для модели формат"""
        formatted_history = ""
        for message in chat_history:
            role = message.get("role", "unknown")
            text = message.get("message", "")
            formatted_history += f"{role.capitalize()}: {text}\n"
        return formatted_history

    def chat(self, documents: list[str], user_input: str, model_name: str, chat_history: list, prompt: str = None):
        """Обработка чата, использование истории и (опционально) пользовательского промпта"""

        model_data = self.load_model(model_name)

        # Загружаем нужную модель и токенизатор через HuggingFace pipeline
        try:
            generator_pipeline = pipeline(
                'text-generation',
                model=model_data["generator_model"],
                tokenizer=model_data["generator_tokenizer"],
                max_new_tokens=128,
                temperature=0.7
            )
        except Exception as e:
            raise Exception(f"Ошибка при загрузке пайплайна модели '{model_name}': {str(e)}")

        embedder = model_data["embedder"]

        # Форматируем историю чата
        formatted_history = self.format_chat_history(chat_history)

        # Разбиение документов на чанки и эмбеддинги
        document_chunks = split_into_chunks(documents, self.config.chunk_size)
        doc_embeddings = embedder.encode(document_chunks)

        # Индексация с помощью FAISS
        dimension = doc_embeddings.shape[1]
        index = faiss.IndexFlatL2(dimension)
        index.add(np.array(doc_embeddings))

        # Поиск документов для RAG
        top_docs = search_documents(user_input, embedder, index, document_chunks)
        context = "\n".join(top_docs)
        print(context)

        # Используем дефолтный промпт, если не передан пользовательский
        if not prompt:
            prompt = (
                "Ты — чат-бот-ассистент. Твоя задача — ответить на вопрос, опираясь на предоставленный контекст и историю диалога. "
                "Ты должен придерживаться следующего формата:\n"
                "1. Краткий и чёткий ответ.\n"
                "2. Если контекст не даёт ответа на вопрос, скажи: \"Информация в контексте недостаточна для ответа.\"\n"
                "3. Ответ должен быть строгим и по существу. Не добавляй лишних слов и не выдумывай информацию.\n\n")

        # Генерация ответа на основе контекста и истории чата
        # Добавляем только сам вопрос и контекст в качестве ввода для генератора
        input_text = formatted_history + "\nКонтекст: " + context + "\nПользователь: " + user_input + "\nОтвет:"

        # Используем pipeline для генерации текста
        try:
            generated_output = generator_pipeline(input_text, num_return_sequences=1)
        except Exception as e:
            raise Exception(f"Ошибка при генерации ответа: {str(e)}")

        # Проверка наличия ответа
        if not generated_output or len(generated_output) == 0:
            raise Exception("Ошибка: Модель не сгенерировала ответ")

        # Получаем сгенерированный текст
        response_text = generated_output[0]['generated_text'].split("Ответ:")[-1].strip()

        # Добавляем ответ в историю чата
        chat_history.append({"role": "user", "message": user_input})
        chat_history.append({"role": "bot", "message": response_text})

        # Возвращаем только чистый текст ответа
        return response_text