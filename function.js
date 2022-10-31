
const functions = require('@google-cloud/functions-framework');
const { logger } = require('./shared/logging');
const { transformGrayscale } = require('./grayscale');
const { transformCompress } = require('./compress');
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');
const { v4 } = require('uuid')
const {PubSub} = require('@google-cloud/pubsub');

const pubSubClient = new PubSub();
initializeApp();

async function publishMetadata(file) {
  const message = JSON.stringify(file)
  const dataBuffer = Buffer.from(message)
  const messageId = await pubSubClient.topic('storage-functions-metadata-events')
    .publishMessage({ data: dataBuffer });
  logger.info(messageId)
}

functions.cloudEvent('grayscale', async cloudEvent => {
  logger.info(`Event ID: ${cloudEvent.id}`);
  logger.info(`Event Type: ${cloudEvent.type}`);
  
  const file = cloudEvent.data;
  logger.info(`Bucket: ${file.bucket}`);
  logger.info(`File: ${file.name}`);
  logger.info(`Metageneration: ${file.metageneration}`);
  logger.info(`Created: ${file.timeCreated}`);
  logger.info(`Updated: ${file.updated}`);
  try {
    if (file.name.startsWith('raw/')) {
      await transformGrayscale(file)
      logger.info(`Grayscale ${file.name} finished`);
    } else {
      logger.info(`Grayscale ${file.name} skipped`);
    }
  } finally {
    await publishMetadata(file)
  }
});

functions.cloudEvent('compress', async cloudEvent => {
  logger.info(`Event ID: ${cloudEvent.id}`);
  logger.info(`Event Type: ${cloudEvent.type}`);

  const file = cloudEvent.data;
  logger.info(`Bucket: ${file.bucket}`);
  logger.info(`File: ${file.name}`);
  logger.info(`Metageneration: ${file.metageneration}`);
  logger.info(`Created: ${file.timeCreated}`);
  logger.info(`Updated: ${file.updated}`);
  try {
    if (file.name.startsWith('raw/')) {
      await transformCompress(file)
      logger.info(`Compress ${file.name} finished`);
    } else {
      logger.info(`Compress ${file.name} skipped`);
    }
  } finally {
    await publishMetadata(file)
  }
});

function getDocumentRef(arr, collection = undefined) {
  if (!collection) {
    collection = db.collection(arr.pop())
  }
  const doc = arr.pop()
  if (arr.length === 0)
    return collection.doc(doc);
  collection = collection.collection(doc)
  return getDocumentRef(arr, collection)
}

functions.cloudEvent('metadata-events', async cloudEvent => {
  logger.info(`Event ID: ${cloudEvent.id}`);
  logger.info(`Event Type: ${cloudEvent.type}`);
  
  logger.info(`DATA: ${JSON.stringify(cloudEvent.data)}`)
  const { _comment, data } = cloudEvent.data.message;

  let message = JSON.parse(Buffer.from(data, 'base64').toString());
  
  const db = getFirestore();
  await db.collection('metadata-events').add(message)

  logger.info(`MESSAGE: ${JSON.stringify(message)}`);
});