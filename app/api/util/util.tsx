
import { PineconeClient } from "@pinecone-database/pinecone";


export default async function initPinecone(): Promise<PineconeClient | undefined> {
  try {
    const pinecone = new PineconeClient()

    pinecone.projectName = ""

    await pinecone.init({
      environment: process.env.PINECONE_ENVIRONMENT ?? "",
      apiKey: process.env.PINECONE_API_KEY ?? ""
    });

    return pinecone

  } catch (error) {
    console.error(error)
    return undefined
  }
}

