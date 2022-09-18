import '@twilio-labs/serverless-runtime-types';
import { Context, ServerlessCallback, ServerlessFunctionSignature } from '@twilio-labs/serverless-runtime-types/types';
import { validator } from 'twilio-flex-token-validator';
import * as deepl from 'deepl-node';

type MyEvent = {
  text?: string;
  translateTo?: deepl.TargetLanguageCode;
  token?: string;
};

type MyContext = {
  DEEPL_AUTH_KEY?: string;
  ACCOUNT_SID?: string;
  AUTH_TOKEN?: string;
};

type Mutable<Type> = {
  -readonly [Key in keyof Type]: Type[Key];
};

const cache: any = {};

const fixLang: any = {
  pt: 'pt-BR',
  en: 'en-US',
};

export const handler: ServerlessFunctionSignature = async (context: Context<MyContext>, event: MyEvent, callback: ServerlessCallback) => {
  try {
    const KEY = context.DEEPL_AUTH_KEY!;
    const text = event.text!;
    const translateTo = event.translateTo || 'en-US';

    const { valid } = <any>await validator(event.token!, context.ACCOUNT_SID!, context.AUTH_TOKEN!);

    if (!valid) {
      throw new Error('Invalid token from the Agent.');
    }

    if (!KEY) {
      throw new Error('You forgot to set the param "DEEPL_AUTH_KEY" in your .env file, aborting...');
    }

    if (!text) {
      throw new Error('text is empty');
    }

    const fromCache = cache[`${translateTo}@@@${text}`];
    if (fromCache) {
      return ResponseOK({ ...fromCache, translateTo, fromCache: true }, callback);
    }

    //
    // documentation:
    //    https://github.com/DeepLcom/deepl-node
    //    https://www.deepl.com/docs-api/translate-text/translate-text/
    //
    // availables "translateTo":
    //   BG - Bulgarian
    //   CS - Czech
    //   DA - Danish
    //   DE - German
    //   EL - Greek
    //   EN - English (unspecified variant for backward compatibility; please select EN-GB or EN-US instead)
    //   EN-GB - English (British)
    //   EN-US - English (American)
    //   ES - Spanish
    //   ET - Estonian
    //   FI - Finnish
    //   FR - French
    //   HU - Hungarian
    //   ID - Indonesian
    //   IT - Italian
    //   JA - Japanese
    //   LT - Lithuanian
    //   LV - Latvian
    //   NL - Dutch
    //   PL - Polish
    //   PT - Portuguese (unspecified variant for backward compatibility; please select PT-BR or PT-PT instead)
    //   PT-BR - Portuguese (Brazilian)
    //   PT-PT - Portuguese (all Portuguese varieties excluding Brazilian Portuguese)
    //   RO - Romanian
    //   RU - Russian
    //   SK - Slovak
    //   SL - Slovenian
    //   SV - Swedish
    //   TR - Turkish
    //   UK - Ukrainian
    //   ZH - Chinese (simplified)

    const translator = new deepl.Translator(KEY);
    const result: any = await translator.translateText(text, null, translateTo);

    // Fix a consistency problem on deepl... It returns "pt" but you cannot use purely "pt" to translate again, has to be "pt-BR"
    if (fixLang[result.detectedSourceLang]) {
      result.detectedSourceLang = fixLang[result.detectedSourceLang];
    }

    cache[`${translateTo}@@@${text}`] = result;
    return ResponseOK({ ...result, translateTo }, callback);
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
  response.setBody(typeof obj === 'string' ? { obj } : obj);
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
  response.setBody({ error: typeof e === 'string' ? e : e.message });
  callback(null, response);
};
