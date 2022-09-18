import { Manager } from '@twilio/flex-ui';

export const request = async (url: string, params = {}) => {
  const manager = Manager.getInstance();
  const token = manager.store.getState().flex.session.ssoTokenPayload.token;

  const body = {
    ...params,
    token,
  };

  const options = {
    method: 'POST',
    body: new URLSearchParams(body),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    },
  };

  const respRaw = await fetch(url, options);
  const resp = await respRaw.json();

  if (resp.error) {
    throw new Error(resp.error);
  }

  return resp;
};
