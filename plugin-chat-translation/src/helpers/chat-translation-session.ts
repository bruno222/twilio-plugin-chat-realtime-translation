const cache: any = {};

/*
Agent message is being translated to customer language in the plugin on "beforeSendMessage" event, i.e. EN > DE
Once the message is sent in customer language, it will be translated in the UI to agent language, i.e. DE > EN
To avoid agent message being translated twice (EN > DE > EN) we store original here.
This storage will not survive reload though.
 */

export const addOriginalToCache = (translation: string, original: string) => {
    cache[translation] = original
}

export const getOriginalFromCache = (translation: string) => cache[translation]
