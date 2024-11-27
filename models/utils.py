from sentence_transformers import SentenceTransformer
import faiss
import numpy as np


# Разбиение текста на чанки
def split_into_chunks(text, chunk_size=500):
    chunks = []
    # Если это список документов, обрабатываем каждый документ по отдельности
    if isinstance(text, list):
        for doc in text:
            if isinstance(doc, str):
                # Разбиваем каждый документ
                for i in range(0, len(doc), chunk_size):
                    chunk = doc[i:i + chunk_size]
                    if '.' in chunk:
                        last_period = chunk.rfind('.')
                        chunks.append(chunk[:last_period + 1].strip())
                        remainder = chunk[last_period + 1:].strip()
                        if remainder:
                            chunks.append(remainder)
                    else:
                        chunks.append(chunk.strip())
    else:
        # Если это просто строка, разбиваем её на чанки
        for i in range(0, len(text), chunk_size):
            chunk = text[i:i + chunk_size]
            if '.' in chunk:
                last_period = chunk.rfind('.')
                chunks.append(chunk[:last_period + 1].strip())
                remainder = chunk[last_period + 1:].strip()
                if remainder:
                    chunks.append(remainder)
            else:
                chunks.append(chunk.strip())

    return chunks


# Поиск документов с использованием FAISS
def search_documents(query, embedder, index, document_chunks, top_k=3):
    query_embedding = embedder.encode([query])
    distances, indices = index.search(np.array(query_embedding), top_k)
    return [document_chunks[i] for i in indices[0]]
