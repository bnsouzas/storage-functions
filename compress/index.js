const { Storage } = require('@google-cloud/storage')
const { v4 } = require('uuid')
const fs = require('fs')
const { promisify } = require('util')
const sharp = require('sharp')
const { logger } = require('../shared/logging')

const unlink = promisify(fs.unlink)

async function transformCompress(file) {
  const id = v4();
  const extension = file.name.split('.').at(-1)
  const tmpRawFile = `${id}.${extension}`;
  const tmpCompressFile = `compress-${id}.${extension}`
  try {
    const storage = new Storage();
    const bucket = storage.bucket(file.bucket);
    await bucket.file(file.name).download({ destination: tmpRawFile });
    await sharp(tmpRawFile).toFormat("jpeg", { mozjpeg: true }).toFile(tmpCompressFile);
    await bucket.upload(tmpCompressFile, { destination: file.name.replace('raw', 'compress') })
  } finally {
    await Promise.all([unlink(tmpRawFile), unlink(tmpCompressFile)])
    logger.info(`Compress finished and Cleaned Up: ${file.name}`)
  }
}

module.exports = { transformCompress }