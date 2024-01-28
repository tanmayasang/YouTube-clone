import express from "express";
import ffmmpeg from "fluent-ffmpeg";

const app = express();
app.use(express.json());

app.post("/process-video", (req,res) => {
    //Get the path of the input video file from the request body 
    const inputFilePath = req.body.inputFilePath;
    const outputFilePath = req.body.outputFilePath;

    if (!inputFilePath || !outputFilePath){
        res.status(400).send("Bad Request: Missing file path.");
    }

    ffmmpeg(inputFilePath)
    .outputOptions("-vf", "scale=0:360")       //360p conversion
    .on("end", () => {
       res.status(200).send("Processing done successfully.")
    })
    .on("error", (err) => {
        console.log(`An error occurred: ${err.message}`);
        res.status(500).send(`Internal Server Error: ${err.message}`);
    })
    .save(outputFilePath);

   
            
});
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Video processing service listening at http://localhost:${port}`);
});