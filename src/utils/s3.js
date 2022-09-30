const S3 = require("aws-sdk/clients/s3");
const fs = require('fs');

const bucket_name = process.env.AWS_BUCKET_NAME
const region = process.env.AWS_BUCKET_REGION
const accessKeyId = process.env.AWS_S3_ACCESS_KEY_ID
const secretAccessKey = process.env.AWS_S3_SECRET_ACCESS_KEY

const s3 = new S3({
    region,
    accessKeyId,
    secretAccessKey
});

// Upload file to s3 bucket
function uploadFile(file) {
    const fileStream = fs.createReadStream(file.path)

    const uploadParams = {
        Bucket: bucket_name,
        Body: fileStream,
        Key: file.filename
    }
    return s3.upload(uploadParams).promise()
}
exports.uploadFile = uploadFile;

// downloads a file from s3
function getFileStream(fileKey) {
    const downloadParams = {
        Key: fileKey,
        Bucket: bucket_name
    }
    return s3.getObject(downloadParams).createReadStream()
}
exports.getFileStream = getFileStream;

// delete a file from s3
function deleteFileStream(fileKey) {
    const deleteParams = {
        Key: fileKey,
        Bucket: bucket_name,
    }
    s3.deleteObject(deleteParams, (error, data) => {
        // next(error, data)
    })
}
exports.deleteFileStream = deleteFileStream;

// exports.deletefiles = s3.deleteObjects(
//     {
//       Bucket:  bucket_name,
//       Delete: {
//         Objects: [{ Key: 'http://localhost:8080/api/openEnded/deleteImage/' }],
//         Quiet: false,
//       },
//     },
//     function (err, data) {
//       if (err) console.log('err ==>', err);
//       console.log('delete successfully', data);
//       return res.status(200).json(data);
//     }
//   );