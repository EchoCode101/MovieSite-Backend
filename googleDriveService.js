import axios from "axios";

const GOOGLE_DRIVE_API = "https://www.googleapis.com/upload/drive/v3/files";
const API_KEY = "YOUR_GOOGLE_API_KEY";

// Function to get the raw video stream URL
export const getGoogleDriveRawStream = async (fileId) => {
  try {
    const response = await axios.get(`${GOOGLE_DRIVE_API}/${fileId}`, {
      params: { key: API_KEY, alt: "media" }, // Use "alt=media" to get the raw file
      responseType: "stream",
    });

    return response.data; // Return the video stream
  } catch (error) {
    console.error("Error fetching raw video stream:", error.message);
    throw error;
  }
};

export const uploadFileToGoogleDrive = async (file) => {
  try {
    const form = new FormData();
    form.append(
      "metadata",
      new Blob([JSON.stringify({ name: file.originalname })], {
        type: "application/json",
      })
    );
    form.append("file", file.buffer);

    const response = await axios.post(
      `${GOOGLE_DRIVE_API}?uploadType=multipart`,
      form,
      {
        headers: {
          Authorization: `Bearer YOUR_ACCESS_TOKEN`,
          "Content-Type": "multipart/related",
        },
      }
    );

    return response.data.id; // Return the file ID
  } catch (error) {
    console.error("Error uploading file to Google Drive:", error.message);
    throw error;
  }
};
