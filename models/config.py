import os

class ModelConfig:
    # Пути и параметры для загрузки моделей
    embedder_model_name = "paraphrase-MiniLM-L6-v2"  # Название модели Sentence-BERT
    chunk_size = 512  # Размер чанков для разбиения текста
    documents_path = "app/data/documents.txt"  # Путь к данным для поиска