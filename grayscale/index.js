const { Storage } = require('@google-cloud/storage')
const { v4 } = require('uuid')
const fs = require('fs')
const { promisify } = require('util')
const sharp = require('sharp')
const { logger } = require('../shared/logging')

const unlink = promisify(fs.unlink)

async function transformGrayscale(file) {
  const id = v4();
  const extension = file.name.split('.').at(-1)
  const tmpRawFile = `${id}.${extension}`;
  const tmpGrayFile = `gray-${id}.${extension}`
  try {
    const storage = new Storage();
    const bucket = storage.bucket(file.bucket);
    await bucket.file(file.name).download({ destination: tmpRawFile });
    await sharp(tmpRawFile).grayscale().toFile(tmpGrayFile);
    await bucket.upload(tmpGrayFile, { destination: file.name.replace('raw', 'grayscale') })
  } finally {
    await Promise.all([unlink(tmpRawFile), unlink(tmpGrayFile)])
    logger.info(`Grayscale finished and Cleaned Up: ${file.name}`)
  }
}

module.exports = { transformGrayscale }