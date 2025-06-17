import '@twilio-labs/serverless-runtime-types';
import {ServerlessCallback, ServerlessFunctionSignature} from '@twilio-labs/serverless-runtime-types/types';
import {validator} from 'twilio-flex-token-validator';
import OpenAIApi from 'openai'

type MyEvent = {
    text?: string
    to?: string
    token?: string
    request: {
        cookies: {}
        headers: {}
    }
};

type MyContext = {
    OPENAI_API_KEY?: string;
    ACCOUNT_SID?: string;
    AUTH_TOKEN?: string;
};

export const handler: ServerlessFunctionSignature<MyContext, MyEvent> = async function (
    context: MyContext,
    event: MyEvent,
    callback: ServerlessCallback,
) {

    console.log('>>> event', event.to, event.text)

    try {
        const text = event.text!;
        const to = event.to || 'EN';

        // const { valid } = <any>await validator(event.token!, context.ACCOUNT_SID!, context.AUTH_TOKEN!);

        // if (!valid) {
        //   throw new Error('Invalid token from the Agent.');
        // }

        if (!text) {
            throw new Error('text is empty');
        }

        const openai = new OpenAIApi({apiKey: context.OPENAI_API_KEY})


        let systemPrompt = `
                        You are translator, you have to figure out the source language.
                        Possible source language values are:
                         - EN = English
                         - DE = German
                         - ES = Spanish
                         - FR = French
                         - IT = Italian
                         
                        The target language is ${to}.
                        You should provide the answer strictly in JSON format, it will be directly parsed.
                        Thus NO comments allowed, NO formatting allowed, ONLY body of the JSON.
                        You will be fined for $1000 if you fail to adhere to the output format requirements!!! 
                        Here is an example of output JSON for the input phrase "Hallo! Wie geht es dir?" and target language en-US:
                        """
                            {
                                "translation": "Hello! How are you doing?",
                                "sourceLanguage": "EN"
                            }
                        """
                        `

        // console.log('>>> system prompt', systemPrompt)

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    'role': 'system', 'content': systemPrompt
                },
                {'role': 'user', 'content': `Here is the text to be translated "${text}"`},
            ],
        })

        console.log('>>>', completion.choices[0].message.content!)

        const result = JSON.parse(completion.choices[0].message.content!)

        return ResponseOK({...result}, callback);
    } catch (e) {
        return ohNoCatch(e, callback);
    }
};

export const ResponseOK = (obj: any, callback: ServerlessCallback) => {
    console.error('Response: ', typeof obj, obj);
    const response = new Twilio.Response();
    response.setStatusCode(200);
    response.appendHeader('Access-Control-Allow-Origin', '*');
    response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS POST GET');
    response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
    response.appendHeader('Content-Type', 'application/json');
    response.setBody(typeof obj === 'string' ? {obj} : obj);
    callback(null, response);
};

export const ohNoCatch = (e: any, callback: ServerlessCallback) => {
    console.error('Exception: ', typeof e, e);
    const response = new Twilio.Response();
    response.setStatusCode(403);
    response.appendHeader('Access-Control-Allow-Origin', '*');
    response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS POST GET');
    response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
    response.appendHeader('Content-Type', 'application/json');
    response.setBody({error: typeof e === 'string' ? e : e.message});
    callback(null, response);
};
