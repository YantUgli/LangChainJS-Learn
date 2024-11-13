import { ChatOpenAI } from "@langchain/openai";

import * as dotenv from 'dotenv';
dotenv.config();

const model = new ChatOpenAI({
    modelName: "gpt-4o",
    temperature: 0.7,
    maxTokens: 1000,
    verbose: true,
})

// ini satu
const response = await model.invoke('write a poem about ai');
// ini batch
// const response = await model.batch(['hello', 'how are you?']);

console.log(response);
