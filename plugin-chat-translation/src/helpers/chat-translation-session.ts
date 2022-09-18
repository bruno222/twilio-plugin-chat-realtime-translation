const cache: any = {};

export const setDefaultLang = (chSid: string, translateTo?: string) => {
  cache[chSid] = { translateTo };
};
export const getLang = (chSid: string) => {
  if (cache[chSid]) {
    return cache[chSid].translateTo;
  }

  return process.env.FLEX_APP_DEEPL_ALWAYS_TRANSLATE_TO || 'en-US';
};
