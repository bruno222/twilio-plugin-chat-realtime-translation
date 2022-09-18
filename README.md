## Create an Account at DeepL

- Max. translated characters/month: 500,000 characters

- https://www.deepl.com/pro-checkout/details?productId=1200&yearly=false&trial=false

## How to install:

# First, the function:

1. `cd twilio-functions`
2. `npm install`
3. rename `.env.example.` to `.env.` and follow the instructions of this file.
4. `npm deploy`

# Now, the Flex Plugin:

1. `cd ../plugin-chat-translation`
2. `npm install`
3. rename `.env.example.` to `.env.` and follow the instructions of this file.
4. `twilio flex:plugins:start` to test things locally.
5. For testing, send a message in English (via WA or SMS or WebChat)... then send a 2nd message in Portuguese for example ("Bom dia"). You should see the translate message at this point.
6. If you are happy, deploy the plugin: `twilio flex:plugins:deploy --changelog "I love Flex"` and then `twilio fex:plugins:release ....`

## TODOs

- [ ] showNotification is not working, fix it copying from the SSO plugin: `Flex.Notifications.showNotification('apiDeeplTranslate', { msg: e.message });`
