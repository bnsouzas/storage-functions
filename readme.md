# Storage Functions
Example serveless using Google Cloud Function with Storage and Pubsub triggers.

The functions will compress images and transform to grayscale.
And save the storage file events on Google Firestore Collection

# Project Stack
 - [NodeJS](https://nodejs.org/en/)
 - [Google Cloud Function](https://cloud.google.com/functions)
 - [Google Cloud Storage](https://cloud.google.com/storage)
 - [Google PubSub](https://cloud.google.com/pubsub)
 - [Google Firestore](https://cloud.google.com/firestore)
# How to test
## Compress
First start the function
```
npm run start:compress
```
Example request:
```
curl -m 70 -X POST https://localhost:8080 \
-H "Authorization: bearer $(gcloud auth print-identity-token)" \
-H "Content-Type: application/json" \
-H "ce-id: 1234567890" \
-H "ce-specversion: 1.0" \
-H "ce-type: google.cloud.storage.object.v1.finalized" \
-H "ce-time: 2020-08-08T00:11:44.895529672Z" \
-H "ce-source: //storage.googleapis.com/projects/_/buckets/photos-dump" \
-d '{
  "name": "raw/20221022_094511.jpg",
  "bucket": "photos-dump",
  "contentType": "image/jpeg",
  "metageneration": "1",
  "timeCreated": "2020-04-23T07:38:57.230Z",
  "updated": "2020-04-23T07:38:57.230Z"
}'
```
## Grayscale
First start the function
```
npm run start:grayscale
```
Example request:
```
curl -m 70 -X POST https://localhost:8080 \
-H "Authorization: bearer $(gcloud auth print-identity-token)" \
-H "Content-Type: application/json" \
-H "ce-id: 1234567890" \
-H "ce-specversion: 1.0" \
-H "ce-type: google.cloud.storage.object.v1.finalized" \
-H "ce-time: 2020-08-08T00:11:44.895529672Z" \
-H "ce-source: //storage.googleapis.com/projects/_/buckets/photos-dump" \
-d '{
  "name": "raw/20221022_094511.jpg",
  "bucket": "photos-dump",
  "contentType": "image/jpeg",
  "metageneration": "1",
  "timeCreated": "2020-04-23T07:38:57.230Z",
  "updated": "2020-04-23T07:38:57.230Z"
}'
```
## Metadata events
First start the function
```
npm run start:metadata
```
Example request:
```
curl -m 70 -X POST http://localhost:8080 \
-H "Content-Type: application/json" \
-H "ce-id: 1234567890" \
-H "ce-specversion: 1.0" \
-H "ce-type: google.cloud.pubsub.topic.v1.messagePublished" \
-H "ce-time: 2020-08-08T00:11:44.895529672Z" \
-H "ce-source: //pubsub.googleapis.com/projects/finance-assistent/topics/storage-functions-metadata-events" \
-d '{
        "message": {
            "attributes": {
                "another": "atribute",
                "attr1":"test"
            },
            "data": "eyAibWVzc2FnZSI6ICJoZWxsbyAzIiB9",
            "messageId":"6152965562283413",
            "message_id":"6152965562283413",
            "publishTime":"2022-10-28T16:43:16.096Z",
            "publish_time":"2022-10-28T16:43:16.096Z"
        },
        "subscription":"projects/finance-assistent/subscriptions/eventarc-southamerica-east1-storage-functions-metadata-events-650746-sub-377"
    }'
```