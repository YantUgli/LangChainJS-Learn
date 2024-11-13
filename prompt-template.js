import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";

import * as dotenv from 'dotenv';
dotenv.config();

// Create model
const model = new ChatOpenAI({
    modelName: "gpt-4",
    temperature: 0.7,
    // maxTokens: 1000,
    // verbose: true,
});

// Create prompt template
// const prompt = ChatPromptTemplate.fromTemplate('You are a comedian. tell a joke based on the following word {input}')
const prompt = ChatPromptTemplate.fromMessages([
    ["system", "generate a joke based on a word provided by the user"],
    ["user", "{input}"]
])

// console.log(await prompt.format({ input: "anjay" }));

// Create Chain
const chain = prompt.pipe(model);

// call chain
const response = await chain.invoke({
    input: "dog",
})

console.log(response);

