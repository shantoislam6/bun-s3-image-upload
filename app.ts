import { Hono } from 'hono';
import AWS from 'aws-sdk';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  region: process.env.AWS_REGION as string,
});

const uploadImageToS3 = async (
  file: Blob,
  fileName: string,
  mimeType: string
): Promise<AWS.S3.ManagedUpload.SendData> => {
  const fileStream = file.stream();

  const uploadParams: AWS.S3.PutObjectRequest = {
    Bucket: process.env.AWS_BUCKET_NAME as string,
    Key: `uploads/${fileName}`,
    Body: fileStream,
    ContentType: mimeType,
    ACL: 'public-read',
  };

  return s3.upload(uploadParams).promise();
};

const app = new Hono();

app.post('/upload', async (c) => {
  try {
    const formData = await c.req.formData();

    const file = formData.get('image') as File | null;
    if (!file) {
      c.status(400);
      return c.json({ error: 'No file provided' });
    }

    const uniqueFileName = `${Date.now()}-${file.name}`;

    const s3Response = await uploadImageToS3(file, uniqueFileName, file.type);

    return c.json({
      message: 'File uploaded successfully',
      url: s3Response.Location,
    });
  } catch (err) {
    c.status(500);
    return c.json({
      error: 'Failed to upload file',
      details: (err as Error).message,
    });
  }
});

export default app;
