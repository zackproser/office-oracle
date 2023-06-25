// AudioStream.tsx
import axios from "axios";

interface AudioStreamProps {
  text: string;
}

const AudioStream = async ({ text, }: AudioStreamProps) => {

  const baseUrl = "https://api.elevenlabs.io/v1/text-to-speech";
  const headers = {
    "Content-Type": "application/json",
    "xi-api-key": process.env.ELEVEN_LABS_API_KEY ?? "",
  };

  const voiceId = process.env.ELEVEN_LABS_VOICE_ID ?? "";

  const requestBody = {
    text,
    voice_settings: { stability: 0, similarity_boost: 0 },
  };

  try {
    const response = await axios.post(`${baseUrl}/${voiceId}`, requestBody, {
      headers,
      responseType: "blob",
    });

    if (response.status === 200) {
      const audio = new Audio(URL.createObjectURL(response.data));
      audio.play();
    }
  } catch (error) {
    console.log(`Error: Unable to stream audio.: ${error}`);
  };
};

export default AudioStream;

