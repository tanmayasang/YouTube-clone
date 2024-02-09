//1. GCS file interactions
//2. Local file iinteractions 
import { Storage } from "@google-cloud/storage";
import fs from 'fs';
import ffmpeg from "fluent-ffmpeg";


const storage = new Storage();

const rawVideoBucketName = "ts-raw-videos";
const processedVideoBucketName = "ts-processed-videos";

const localRawVideoPath = "./raw-videos";
const localProcessedVideoPath = "./processed-videos"

/** Creates the local directories for raw and processed videos */
export function setupDirectories(){
       ensureDirectoryExistence(localRawVideoPath);
       ensureDirectoryExistence(localProcessedVideoPath); 
}

/**
 * @param rawVideoName - The name of the file to convert from {@link localRawVideoPath}
 * @param processedVideoName - The name of the file to convert to {@link localProcessedVideoPath}
 * @returns A promise that resolves when the video has been converted.
 */
export function convertVideo(rawVideoName:string, processedVideoName:string){
    return new Promise<void>((resolve, reject) => {
    ffmpeg(`${localRawVideoPath}/${rawVideoName}`)
    .outputOptions("-vf", "scale=-1:360")       //360p conversion
    .on("end", function() {
       console.log("Processing done successfully.");
       resolve();
    })
    .on("error", (err) => {
        console.log(`An error occurred: ${err.message}`);
        reject(err);
    })
    .save(`${localProcessedVideoPath}/${processedVideoName}`);
})
}
/**
 * 
 * @param fileName - The name of the file to download from the {@link rawVideoBucketName} bucket into the {@link localRawVideoPath} folder.
 * @returns A promise that resolves once the file gets downloaded
 */
export async function downloadRawVideo(fileName: string){
   await storage.bucket(rawVideoBucketName)
    .file(fileName)
    .download({destination: `${localRawVideoPath}/${fileName}}` });

    console.log(`gs://${rawVideoBucketName}/${fileName} downloaded to ${localRawVideoPath}/${fileName}`);
}
/**
 * 
 * @param fileName - the name of the file to delete from the {@link localRawVideoPath} folder
 * @returns a promise that resolves when file has been deleted.
 */

export function deleteRawVideo(fileName: string){
    return deleteFile(`${localRawVideoPath}/${fileName}`);
}
/**
 * 
 * @param fileName - the name of the file to delete from the {@link localProcessedVideoPath} folder
 * @returns a promise that resolves when file has been deleted.
 */

export function deleteProcessedVideo(fileName: string){
    return deleteFile(`${localProcessedVideoPath}/${fileName}`);
}
/**
 * 
 * @param fileName - the name of the file to upload from the ${@link localProcessedVideoPath} folder into the {@link processedVideoBucketName}.
 * @returns A promise that resolves when the file 
 */
export async function uploadProcessedVideo(fileName: string){
    const bucket = storage.bucket(processedVideoBucketName);
    await bucket.upload(`${localProcessedVideoPath}/${fileName}`,{
        destination : fileName
    });
    console.log(`${localProcessedVideoPath}/${fileName} uploaded to gs://${processedVideoBucketName}/${fileName}.`);
    await bucket.file(fileName).makePublic();
}

function deleteFile(filePath: string): Promise <void>{
    return new Promise((resolve, reject) => {
        if (fs.existsSync(filePath)){
            fs.unlink(filePath,(err) => {
                if(err){
                    console.log(`Failed to delete file at ${filePath}`, err);
                    reject(err);
                }else{
                    console.log("file deleted successfully");
                    resolve();
                }
            })
        }else{
            console.log(`File not found at ${filePath}, skipping the delete.`);
            resolve();
        }
        });
}
/**
 * Ensure a directory exists, creating otherwise
 * @param dirPath  - the directory path to check 
 */

function ensureDirectoryExistence(dirPath: string){
    if (!fs.existsSync(dirPath)){
        fs.mkdirSync(dirPath, { recursive: true}); //enables created  nested directories
        console.log(`Directory created at ${dirPath}`);
    }
}