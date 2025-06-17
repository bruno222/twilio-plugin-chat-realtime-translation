// import * as Flex from '@twilio/flex-ui';
import { request } from './request';

export interface Response {
  translation: string;
}

export const apiTranslate = async (text: string, to: string) => {
  try {
    const url = process.env.FLEX_APP_TRANSLATE_URL!;
    if (!url) {
      throw new Error('hey you forgot to set env parameter "FLEX_APP_TRANSLATE_URL" in your ".env" file, aborting...');
    }

    const response = <Response>await request(url, { text, to });
    console.log('@@@ translate API response', response)
    return { text: response.translation };
  } catch (e: any) {
    console.log('@@@ Error translate API: ', e);
    return { text };
  }
};
