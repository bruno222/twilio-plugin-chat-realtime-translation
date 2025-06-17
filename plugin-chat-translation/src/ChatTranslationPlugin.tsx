import React from 'react';
import * as Flex from '@twilio/flex-ui';
import { FlexPlugin } from '@twilio/flex-plugin';
import { TranslationBubble } from './components/TranslationBubble/TranslationBubble';
import { apiTranslate } from './helpers/api-translate';
import {addOriginalToCache} from "./helpers/chat-translation-session";

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

      // Find task by conversationSid
      const taskMap = Flex.Manager.getInstance().store.getState().flex.worker.tasks;
      console.log('@@@ tasks: ', taskMap);

      const matchingTask = Array.from(taskMap.values()).find(
          (task: any) => task?.attributes?.conversationSid === conversationSid
      );

      console.log('@@@ matching task: ', matchingTask);

      // No matching task
      if (!matchingTask) {
        console.log('@@@ matching task is null');
        return;
      }

      // Find customer and agent languages
      const customerLanguage = matchingTask?.attributes?.language ?? process.env.FLEX_APP_DEFAULT_CUSTOMER_LANGUAGE;
      const agentLanguage = Flex.Manager.getInstance().store.getState().flex.worker.attributes?.language ?? process.env.FLEX_APP_DEFAULT_CUSTOMER_LANGUAGE

      // No translation needed
      if (customerLanguage === agentLanguage) {
        console.log('@@@ customer and agent languages are the same', customerLanguage, agentLanguage);
        return;
      }

      const { text } = await apiTranslate(payload.body, customerLanguage);

      addOriginalToCache(text, payload.body)

      payload.body = text;
    });

  }
}
