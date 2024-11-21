import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { CommaSeparatedListOutputParser, StringOutputParser } from "@langchain/core/output_parsers"
import { StructuredOutputParser } from 'langchain/output_parsers'
import { z } from 'zod'

import * as dotenv from 'dotenv';
dotenv.config();

// Create model
const model = new ChatOpenAI({
    modelName: "gpt-4",
    temperature: 0.7,
    // maxTokens: 1000,
    // verbose: true,
});

async function callStringOutputParser() {
    // Create prompt template
    // const prompt = ChatPromptTemplate.fromTemplate('You are a comedian. tell a joke based on the following word {input}')
    const prompt = ChatPromptTemplate.fromMessages([
        ["system", "generate a joke based on a word provided by the user"],
        ["user", "{input}"]
    ])

    // console.log(await prompt.format({ input: "anjay" }));

    // Create Parser
    const parser = new StringOutputParser();

    // Create Chain
    const chain = prompt.pipe(model).pipe(parser);

    // call chain
    return await chain.invoke({
        input: "dog",
    })
}


async function callListOutputParser() {
    const prompt = ChatPromptTemplate.fromTemplate(`
            Provide 5 synonyms, seprated by commmas, for the following word {word}. anseer in Indonesian lenguage      
        `)

    const outputParser = new CommaSeparatedListOutputParser()
    const chain = prompt.pipe(model).pipe(outputParser)

    return await chain.invoke({
        word: 'marah'
    })
}

// Structured Output Parser
async function callStructuredParser() {
    const prompt = ChatPromptTemplate.fromTemplate(`
            extract information from the following phrase. 
            formattting instratuctions: {format_instructions}
            phrase: {phrase}
        `)

    const outputParser = StructuredOutputParser.fromNamesAndDescriptions({
        name: "the name of the person",
        age: "the age of the person"
    })

    const chain = prompt.pipe(model).pipe(outputParser)

    return await chain.invoke({
        phrase: "bryant is 19 years old",
        format_instructions: outputParser.getFormatInstructions()
    })
}

async function callZodOutputParser() {
    const prompt = ChatPromptTemplate.fromTemplate(`
          extract information from the following phrase. 
            formattting instratuctions: {format_instructions}
            phrase: {phrase}
        `)

    const outputParser = StructuredOutputParser.fromZodSchema(
        z.object({
            recipe: z.string().describe("name of recipe"),
            ingredients: z.array(z.string()).describe("ingredients")
        })
    )
    const chain = prompt.pipe(model).pipe(outputParser)
    return await chain.invoke({
        phrase: "Nasi goreng dibuat dengan menumis bawang putih, bawang merah, dan cabai, lalu menambahkan nasi, kecap manis, garam, dan merica, serta bahan tambahan seperti telur, ayam, atau udang, kemudian disajikan dengan acar, kerupuk, atau irisan mentimun.",
        format_instructions: outputParser.getFormatInstructions()
    })
}

const response = await callZodOutputParser()
console.log(response);

