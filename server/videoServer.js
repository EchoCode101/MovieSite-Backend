import express from "express";
import fs from "fs";
import path from "path";
import url from "url";
import cors from "cors";
// Get __dirname equivalent in ES modules
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 7200; // You can change the port as needed

// Enable CORS
app.use(cors());
// Serve video files from a specific directory
app.get("/video/:videoID", (req, res) => {
  const videoID = req.params.videoID; // Get videoID from the URL

  // Generate the path to the video file based on videoID
  const videoFilePath = path.join(__dirname, "../", "videos", `${videoID}.mp4`);

  // Check if the file exists
  fs.access(videoFilePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error("Video file not found:", err);
      return res.status(404).send("Video not found");
    }

    // Serve the video file
    const stat = fs.statSync(videoFilePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const [start, end] = range.replace(/bytes=/, "").split("-");

      const startByte = parseInt(start, 10);
      const endByte = end ? parseInt(end, 10) : fileSize - 1;
      const chunkSize = endByte - startByte + 1;

      res.writeHead(206, {
        "Content-Range": `bytes ${startByte}-${endByte}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunkSize,
        "Content-Type": "video/mp4",
      });

      const videoStream = fs.createReadStream(videoFilePath, {
        start: startByte,
        end: endByte,
      });
      videoStream.pipe(res);
    } else {
      res.writeHead(200, {
        "Content-Length": fileSize,
        "Content-Type": "video/mp4",
      });

      const videoStream = fs.createReadStream(videoFilePath);
      videoStream.pipe(res);
    }
  });
});

app.listen(PORT, () => {
  console.log(`Video server is running on http://localhost:${PORT}`);
});
