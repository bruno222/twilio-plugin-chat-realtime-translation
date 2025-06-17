import React, {useEffect, useState} from 'react';

import {getOriginalFromCache} from '../../helpers/chat-translation-session';
import {apiTranslate} from '../../helpers/api-translate';
import {Box, Text} from "@twilio-paste/core";
import {Theme} from "@twilio-paste/theme";
import {ITask, withTaskContext} from "@twilio/flex-ui";
import * as Flex from "@twilio/flex-ui";

interface Props {
    message?: any;
    conversationSid?: string;
}

export const TranslationBubble = withTaskContext((props: Props & { task: ITask }) => {

    if (!props.task) return null

    const customerLanguage = props.task.attributes.language ?? process.env.FLEX_APP_DEFAULT_CUSTOMER_LANGUAGE;
    const agentLanguage = Flex.Manager.getInstance().store.getState().flex.worker.attributes?.language ?? process.env.FLEX_APP_DEFAULT_CUSTOMER_LANGUAGE
    console.log("customerLanguage, agentLanguage", customerLanguage, agentLanguage)


    if (customerLanguage === agentLanguage) return null

    const {
        message: {
            isFromMe,
            source: {body},
        },
    } = props;

    let translationDirection: string

    if (isFromMe) {
        translationDirection = `[${agentLanguage} > ${customerLanguage}]`
    } else {
        translationDirection = `[${customerLanguage} > ${agentLanguage}]`
    }

    const [translatedBody, setTranslatedBody] = useState('...');

    useEffect(() => {
        console.log(`@@@ ${body}`, props);

        if (isFromMe && !!getOriginalFromCache(body)) {
            console.log(`@@@ cache found: ${body} > ${getOriginalFromCache(body)}`);
            setTranslatedBody(getOriginalFromCache(body))
        } else {
            console.log(`@@@ cache NOT found: ${body}`);
            apiTranslate(body, agentLanguage).then(({text}) => {
                setTranslatedBody(text);
            });
        }


    }, []);

    return (
        <Theme.Provider theme='default'>
            <Box
                padding="space40"
                borderStyle="solid"
                borderWidth="borderWidth10"
                borderColor="colorBorderWeaker"
                borderRadius="borderRadius30"
                backgroundColor="colorBackgroundPrimaryWeak"
            >
                <Box marginBottom="space30" display="flex" justifyContent="space-between" alignItems="center">
                    <Text as="header" fontSize="fontSize40" fontWeight="fontWeightMedium">
                        {isFromMe ? "Original" : "Translation"}
                    </Text>
                    <Text as="span" fontSize="fontSize30" color="colorTextBrandInverse" marginLeft="space20">
                        {translationDirection}
                    </Text>
                </Box>

                <Box>
                    <Text as="span" fontSize="fontSize30" fontWeight="fontWeightMedium">
                        {translatedBody}
                    </Text>
                </Box>

            </Box>
        </Theme.Provider>
    );
});
