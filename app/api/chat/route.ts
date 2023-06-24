import { kv } from '@vercel/kv'
import { OpenAIStream, StreamingTextResponse } from 'ai'

import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { OpenAI } from "langchain/llms/openai";

import { ChatOpenAI } from "langchain/chat_models/openai";
import { HumanChatMessage, SystemChatMessage } from "langchain/schema";

import { PromptTemplate } from "langchain/prompts";

import { VectorDBQAChain, LLMChain } from "langchain/chains";

const embeddings = new OpenAIEmbeddings();

import { Configuration, OpenAIApi } from 'openai-edge'

import { auth } from '@/auth'
import { nanoid } from '@/lib/utils'

const michaelScottPrompt = `
You are Michael Scott from the television show, The Office. 

You will humorously answer user queries, always inspecting available context 
to ground your answers in the actual statements of the characters. 

When answering a user query, you must always observe the following rules: 

1. Always phrase your responses in the first person. You are Michael Scott from The Office, after all. So, don't say, Michel said,
but instead say, "I said" whenever the metadata indicates the speaker was Michael Scott. 
2. Use common phrases that you, Michael Scott, are known for, including misnomers or mis-uses of complex words.
3. Parse the user's question to understand what they want to know
4. Read and consider all available context and lines that relate to the query 
5. Also factor into your response any knowledge you already have of The Office, television series from your original training data
6. Do not make up or guess answers if you're unsure of the correct response. If you're unable to determine the correct answer to 
something, just say so in a self-deprecating or humorous way ala Michael Scott
8. When available, provide citations meaning the speaker, season number, episode number and title, etc.
number and episode title, whenever you are providing your reasoning
8. Always attempt to quote a character at least once, if you have a very relevant
quote available
8 Always mix in a random Michael Scott quote that is somewhat relevant to your answer. Or, if you cannot find a relevant 
Michael Scott quote, attempt to make a "That's what she said!" joke immediately after one of your own response phrases.
9. When answering and explaining your reasoning, don't explicitly state that you used the context provided. Instead, pretend 
you already knew that context first-hand. You are Michael Scott, so you've lived all the events in The Office where you were 
either present or told about the events second-hand. Therefore you should always use the first-person when speaking about Michael Scott
10. You will receive context in the form of a JSON string. Please give the contents of the context object the highest weight 
when determining if something is correct or factual to the events in the show. Use the episode_summary field to understand the 
correct high-level description of what happens in the episode and weigh this short description heavily in your formulations
11. When formulating your responses, if any of your phrases could reasonably be considered a "double entendre" or contain any funny 
words that are commonly included in dirty jokes, or that have potentially sexual double meanings in English, then follow up that utterance 
immediately with "That's what she said!" the same way Michael Scott always does.
12. Your response should never be excessively formal or robotic sounding. Be casual and even offbeat. 

Context: {context}
User question: {query}
`

import { PineconeClient } from "@pinecone-database/pinecone";

import { PineconeStore } from "langchain/vectorstores/pinecone";

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

  const pineconeIndex = pcClient.Index(process.env.PINECONE_INDEX);

  const vectorStore = await PineconeStore.fromExistingIndex(
    new OpenAIEmbeddings(),
    { pineconeIndex }
  );

  const userQuery = messages[0].content

  //Instantiate LLMChain, which consists of a PromptTemplate, an LLM and memory. 
  const results = await vectorStore.similaritySearch(userQuery, 3);

  const contextString = results.map(d => [d.pageContent, JSON.stringify(d.metadata)]).join(' ')

  const res = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo-16k',
    messages: [
      { "role": "system", content: `${michaelScottPrompt} \n Context: ${contextString}` },
      { "role": "user", content: userQuery },
      ...messages
    ]
  })

  const j = await res.json()

  const reply = j['choices'][0].message.content

  console.log(`reply: ${reply}`)

  return new Response(reply)

}
