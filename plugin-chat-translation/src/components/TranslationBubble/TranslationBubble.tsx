import React, { useEffect, useState } from 'react';

import { setDefaultLang } from '../../helpers/chat-translation-session';
import { apiDeeplTranslate } from '../../helpers/api-deepl-translate';

interface Props {
  // enabled: boolean;
  message?: any;
  conversationSid?: string;
}

export const TranslationBubble = (props: Props) => {
  const [translatedBody, setTranslatedBody] = useState('...');
  const [sourceLang, setSourceLang] = useState('');

  const {
    // enabled,
    conversationSid,
    message: {
      isFromMe,
      source: { body },
    },
  } = props;

  const color = isFromMe ? 'yellow' : 'blue';

  useEffect(() => {
    console.log(`@@@ ${body}`, props);

    apiDeeplTranslate(body).then(({ text, detectedSourceLang }) => {
      setTranslatedBody(text);
      detectedSourceLang && setSourceLang(detectedSourceLang.toLocaleUpperCase());
      !isFromMe && setDefaultLang(conversationSid!, detectedSourceLang);
    });
  }, []);

  const showSourceLang = sourceLang && sourceLang != process.env.FLEX_APP_DEEPL_ALWAYS_TRANSLATE_TO?.toUpperCase();
  const showBody = translatedBody != body;

  return (
    <>
      {showBody && <p style={{ color }}>{translatedBody}</p>}
      {showSourceLang && <p style={{ color, fontSize: '9px', textAlign: 'end' }}>[{sourceLang}]</p>}
    </>
  );
};
