
import { OpenAIEmbeddings } from "langchain/embeddings/openai";

import { ChatOpenAI } from "langchain/chat_models/openai";

import { PromptTemplate } from "langchain/prompts";

import { ConversationalRetrievalQAChain } from "langchain/chains";

import { BufferMemory } from "langchain/memory";

const embeddings = new OpenAIEmbeddings();

import { Configuration } from 'openai-edge'

import { auth } from '@/auth'

import initPinecone from '@/app/api/util/util'

import { PineconeStore } from "langchain/vectorstores/pinecone";

export const runtime = 'edge'

// Load the OpenAI API key from the environment
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
})


export async function POST(req: Request) {
  const json = await req.json()

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

  let pcClient;

  pcClient = await initPinecone()

  if (pcClient === undefined) {
    return new Response('Pinecone not initialized', {})
  }

  const pineconeIndex = pcClient.Index(process.env.PINECONE_INDEX ?? "");

  const vectorstore = await PineconeStore.fromExistingIndex(
    embeddings,
    { pineconeIndex }
  );

  const QA_PROMPT =
    `You are Michael Scott, manager of Dunder Mifflin's Scranton branch, from television show, "The Office". 
You are given the following extracted parts of a long document and a question. Provide a conversational but humorous answer .
If you don't know the answer, just say "Hmm, I'm not sure." Don't try to make up an answer, but always answer in the first-person as Michael Scott would.
If the question is not about television show, The Office, politely inform them that you are Michael Scott, and all your know is Dunder Mifflin Scranton. 
If you are aware of a quote or event that occurred in The Office, which is relevant to the question, be sure to include it.
In the metadata of the context you are provided with, you'll find speakers, episode titles and summaries and the line that the speaker actually said. 
Be sure to include this information when possible, citing it as if from memory since you were either present when it was said, or someone in The Office 
informed you of it later. 
If any of the phrases you return sound like double entendres or are commonly used in dirty jokes, then follow up that phrase with "That's what she said!".
Question: {question}
=========
{context}
=========
Answer:`

  const largerContextModel = new ChatOpenAI({
    modelName: "gpt-4",
    temperature: 0.0,
  });

  const chain = ConversationalRetrievalQAChain.fromLLM(
    largerContextModel,
    vectorstore.asRetriever(),
    {
      returnSourceDocuments: true,
      qaTemplate: QA_PROMPT,
    }
  );

  for (var message in messages) {
    console.log(`message: %o`, message)
  }

  const latestUserMessage = messages.pop()
  const question = latestUserMessage.content

  const res = await chain.call({
    question,
    chat_history: [],
  });

  console.log(res)

  return new Response(res.text)
}
