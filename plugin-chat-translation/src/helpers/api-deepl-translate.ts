// import * as Flex from '@twilio/flex-ui';
import { request } from './request';

export interface Response {
  text: string;
  detectedSourceLang: string;
  translateTo: string;
  fromCache: boolean;
}

// Flex.Notifications.registerNotification({
//   id: 'translationError',
//   content: 'translationError',
//   type: Flex.NotificationType.error,
// });

export const apiDeeplTranslate = async (text: string, translateTo = process.env.FLEX_APP_DEEPL_ALWAYS_TRANSLATE_TO) => {
  try {
    const url = process.env.FLEX_APP_DEEPL_TRANSLATE_URL!;
    if (!url) {
      throw new Error('hey you forgot to set env parameter "FLEX_APP_DEEPL_TRANSLATE_URL" in your ".env" file, aborting...');
    }

    const { text: textOut, detectedSourceLang } = <Response>await request(url, { text, translateTo });
    return { text: textOut, detectedSourceLang };
  } catch (e: any) {
    console.log('@@@ Error apiDeeplTranslate: ', e);
    // Flex.Notifications.showNotification('translationError', { msg: e.message });
    return { text };
  }
};
