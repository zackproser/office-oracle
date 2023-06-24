import { kv } from '@vercel/kv'
import { OpenAIStream, StreamingTextResponse } from 'ai'

import { OpenAIEmbeddings } from "langchain/embeddings/openai";

const embeddings = new OpenAIEmbeddings();

import { Configuration, OpenAIApi } from 'openai-edge'

import { auth } from '@/auth'
import { nanoid } from '@/lib/utils'

import { PineconeClient } from "@pinecone-database/pinecone";

const pinecone = new PineconeClient();

async function initPinecone() {
  try {
    const pinecone = new PineconeClient()

    pinecone.projectName = "the-office-oracle"

    await pinecone.init({
      environment: process.env.PINECONE_ENVIRONMENT,
      apiKey: process.env.PINECONE_API_KEY,
    });

    console.log(pinecone.projectName)

    return pinecone

  } catch (error) {

    console.error(error)

  }
}

export const runtime = 'edge'

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
})

const openai = new OpenAIApi(configuration)

export async function POST(req: Request) {
  const json = await req.json()

  console.log('POST function')
  console.dir(json)

  const { messages, previewToken } = json
  const session = await auth()

  if (session == null) {
    return new Response('Unauthorized', {
      status: 401
    })
  }

  if (previewToken) {
    configuration.apiKey = previewToken
  }

  const pcClient = await initPinecone()

  const indexesList = await pcClient.listIndexes();

  console.log(`indexesList ${indexesList}`)

  const queryVec = await embeddings.embedQuery(messages[0].content);

  const index = pcClient.Index("the-office-oracle");
  const queryRequest = {
    vector: queryVec,
    topK: 10,
    includeValues: true,
    includeMetadata: true,
  };
  const queryResponse = await index.query({ queryRequest });

  console.log(`queryResponse: ${JSON.stringify(queryResponse)}`);

  const res = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages,
    temperature: 0.7,
    stream: true
  })

  const stream = OpenAIStream(res, {
    async onCompletion(completion) {
      const title = json.messages[0].content.substring(0, 100)
      const userId = session?.user?.id
      if (userId) {
        const id = json.id ?? nanoid()
        const createdAt = Date.now()
        const path = `/chat/${id}`
        const payload = {
          id,
          title,
          userId,
          createdAt,
          path,
          messages: [
            ...messages,
            {
              content: completion,
              role: 'assistant'
            }
          ]
        }
        await kv.hmset(`chat:${id}`, payload)
        await kv.zadd(`user:chat:${userId}`, {
          score: createdAt,
          member: `chat:${id}`
        })
      }
    }
  })

  return new StreamingTextResponse(stream)
}
