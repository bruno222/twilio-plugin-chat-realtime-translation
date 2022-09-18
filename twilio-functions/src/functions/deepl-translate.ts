import '@twilio-labs/serverless-runtime-types';
import { Context, ServerlessCallback, ServerlessFunctionSignature } from '@twilio-labs/serverless-runtime-types/types';
import * as deepl from 'deepl-node';

type MyEvent = {
  text?: string;
  translateTo?: deepl.TargetLanguageCode;
};

type MyContext = {
  DEEPL_AUTH_KEY?: string;
};

const cache: any = {};

export const handler: ServerlessFunctionSignature = async (context: Context<MyContext>, event: MyEvent, callback: ServerlessCallback) => {
  const KEY = context.DEEPL_AUTH_KEY!;
  const text = event.text!;
  const translateTo = event.translateTo || 'en-US';

  if (!KEY) {
    const error = 'You forgot to set the param "DEEPL_AUTH_KEY" in your .env file, aborting...';
    console.log(error);
    return callback(null, { error });
  }

  if (!text) {
    const error = 'text is empty';
    console.log(error);
    return callback(null, { error });
  }

  const fromCache = cache[`${translateTo}@@@${text}`];
  if (fromCache) {
    return callback(null, { ...fromCache, translateTo, fromCache: true });
  }

  const translator = new deepl.Translator(KEY);

  try {
    const result = await translator.translateText(text, null, translateTo);

    cache[`${translateTo}@@@${text}`] = result;

    callback(null, { ...result, translateTo });
  } catch (e) {
    const error = `'Error on translating: ${(e as any).message}`;
    console.log(error);
    callback(null, { error });
  }
};
