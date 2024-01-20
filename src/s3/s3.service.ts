import { Injectable } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  PutObjectCommandInput,
  PutObjectCommandOutput,
} from '@aws-sdk/client-s3';

import * as fs from 'fs';

@Injectable()
export class S3Service {
  private region: string;
  private s3: S3Client;

  constructor() {
    this.region = process.env.S3_REGION || 'us-east-1';
    const endpoint = `https://${process.env.S3_BUCKET}.${this.region}.linodeobjects.com`;
    this.s3 = new S3Client({
      region: this.region,
      endpoint,
      forcePathStyle: true,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
      },
    });
  }
  async uploadFile(file: Express.Multer.File, key: string): Promise<string> {
    const bucket = process.env.S3_BUCKET;
    const input: PutObjectCommandInput = {
      Body: file.buffer,
      Bucket: bucket,
      Key: key,
      ContentType: file.mimetype || 'application/octet-stream',
      ContentDisposition: 'attachment',
      ACL: 'public-read',
    };

    try {
      const response: PutObjectCommandOutput = await this.s3.send(
        new PutObjectCommand(input),
      );
      if (response.$metadata.httpStatusCode === 200) {
        return `https://${bucket}.${this.region}.linodeobjects.com/currentvpn-public/${key}`;
      }
      throw new Error('Image not saved in s3!');
    } catch (err) {
      throw err;
    }
  }

  async uploadFileStream(
    fileStream: fs.ReadStream,
    contentType = 'application/octet-stream',
    key: string,
  ): Promise<string> {
    const bucket = process.env.S3_BUCKET;
    const input: PutObjectCommandInput = {
      Body: fileStream,
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
      ContentDisposition: 'attachment',
      ACL: 'public-read',
    };

    try {
      const response = await this.s3.send(new PutObjectCommand(input));
      if (response.$metadata.httpStatusCode === 200) {
        return `https://${bucket}.${this.region}.linodeobjects.com/currentvpn-public/${key}`;
      }
      throw new Error('Image not saved in s3!');
    } catch (err) {
      throw err;
    }
  }
}
