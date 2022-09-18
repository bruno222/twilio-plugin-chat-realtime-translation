import React from 'react';
import * as Flex from '@twilio/flex-ui';
import { FlexPlugin } from '@twilio/flex-plugin';
import { TranslationBubble } from './components/TranslationBubble/TranslationBubble';
import { apiDeeplTranslate } from './helpers/api-deepl-translate';
import { getLang } from './helpers/chat-translation-session';

const PLUGIN_NAME = 'ChatTranslationPlugin';

export default class ChatTranslationPlugin extends FlexPlugin {
  constructor() {
    super(PLUGIN_NAME);
  }

  async init(flex: typeof Flex, manager: Flex.Manager): Promise<void> {
    //
    // Add the translated messages in each message (e.g. each bubble)
    //
    flex.MessageBubble.Content.add(<TranslationBubble /*enabled={true}*/ key="translationBubble" />, {
      if: (prop) => true,
    });

    //
    // Once the Agent sends the message, translate it before sending it.
    //
    flex.Actions.addListener('beforeSendMessage', async (payload) => {
      console.log('@@@ beforeSendMessage payload: ', payload);
      const { conversationSid } = payload;

      if (!conversationSid) {
        console.log('@@@ Not a chat, aborting...');
        return;
      }

      // const {
      //   conversation: {
      //     source: {
      //       attributes: { customerPublicKey },
      //     },
      //   },
      // } = payload;

      // if (!customerPublicKey) {
      //   console.log('@@@ Not an E2E encrypted chat, aborting...');
      //   return;
      // }

      const translateTo = getLang(conversationSid);

      // no translation is needed
      if (translateTo === 'en-US') {
        return;
      }

      const { text } = await apiDeeplTranslate(payload.body, translateTo);
      payload.body = text;
    });
  }
}
