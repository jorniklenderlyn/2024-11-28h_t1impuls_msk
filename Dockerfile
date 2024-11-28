FROM python:3.11.4

ENV PYTHONUNBUFFERED=1

WORKDIR /usr/src/app 

COPY requirements.txt requirements.txt
RUN pip install -r requirements.txt
COPY . .
RUN playwright install

CMD [ "python", "main.py" ]

# sudo docker run --name backend --expose 8080 --network=gis-app-net gis_app