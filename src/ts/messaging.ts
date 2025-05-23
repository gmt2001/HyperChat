import type { Unsubscriber } from './queue';
import { ytcQueue } from './queue';
import sha1 from 'sha-1';
import { chatReportUserOptions, ChatUserActions, ChatReportUserOptions, ChatTimeoutOptions } from '../ts/chat-constants';
import { isReplay } from './storage';

const currentDomain = location.protocol.includes('youtube') ? (location.protocol + '//' + location.host) : 'https://www.youtube.com';

let interceptor: Chat.Interceptor = { clients: [] };

const isYtcInterceptor = (i: Chat.Interceptors, showError = false, ...debug: any[]): i is Chat.YtcInterceptor => {
  const check = i.source === 'ytc';
  if (!check && showError) console.error('Interceptor source is not YTC.', debug);
  return check;
};

interface YtCfg {
  data_: {
    INNERTUBE_API_KEY: string;
    INNERTUBE_CONTEXT: any;
  };
}

/** Register a client to the interceptor. */
const registerClient = (
  port: Chat.Port,
  getInitialData = false
): void => {
  if (interceptor.clients.some((client) => client.name === port.name)) {
    port.postMessage(
      {
        type: 'registerClientResponse',
        success: false,
        failReason: 'Client already registered'
      }
    );
    return;
  }

  // Assign pseudo-unique name
  port.name = `${Date.now()}${Math.random()}`;

  // Unregister client when port disconnects
  port.onDisconnect.addListener(() => {
    const i = interceptor.clients.findIndex(
      (clientPort) => clientPort.name === port.name
    );
    if (i < 0) {
      console.error('Failed to unregister client', { port, interceptor });
      return;
    }
    interceptor.clients.splice(i, 1);
  });

  // Add client to array
  interceptor.clients.push(port);
  port.postMessage(
    {
      type: 'registerClientResponse',
      success: true
    }
  );

  if (getInitialData && isYtcInterceptor(interceptor)) {
    const selfChannel = interceptor.queue.selfChannel.get();
    const payload: Chat.InitialData = {
      type: 'initialData',
      initialData: interceptor.queue.getInitialData(),
      selfChannel: selfChannel != null
        ? {
            name: selfChannel.authorName?.simpleText ?? '',
            channelId: selfChannel.authorExternalChannelId ?? ''
          }
        : null
    };
    port.postMessage(payload);
  }
};

/**
 * Parses the given YTC json response, and adds it to the queue of the
 * interceptor that sent it.
 */
export const processMessageChunk = (json: string): void => {
  if (!isYtcInterceptor(interceptor, true, 'processMessageChunk', json)) return;

  if (interceptor.clients.length < 1) {
    return;
  }

  interceptor.queue.addJsonToQueue(json, false, interceptor);
};

/** Parses a sent message and adds a fake message entry. */
export const processSentMessage = (json: string): void => {
  if (!isYtcInterceptor(interceptor, true, 'processSentMessage', json)) return;

  const fakeJson: Ytc.SentChatItemAction = JSON.parse(json);
  const fakeChunk: Ytc.RawResponse = {
    continuationContents: {
      liveChatContinuation: {
        continuations: [{
          timedContinuationData: {
            timeoutMs: 0
          }
        }],
        actions: fakeJson.actions
      }
    }
  };
  
  interceptor.queue.addJsonToQueue(JSON.stringify(
    fakeChunk
  ), false, interceptor, true);
};

/** Parses and sets initial message data and metadata. */
export const setInitialData = (json: string): void => {
  if (!isYtcInterceptor(interceptor, true, 'setInitialData', json)) return;

  interceptor.queue.addJsonToQueue(json, true, interceptor);

  const parsedJson = JSON.parse(json);

  const actionPanel = (parsedJson?.continuationContents?.liveChatContinuation ||
    parsedJson?.contents?.liveChatRenderer)
    ?.actionPanel;

  const user = actionPanel?.liveChatMessageInputRenderer
    ?.sendButton?.buttonRenderer?.serviceEndpoint
    ?.sendLiveChatMessageEndpoint?.actions[0]
    ?.addLiveChatTextMessageFromTemplateAction?.template
    ?.liveChatTextMessageRenderer ?? {
    authorName: {
      simpleText: parsedJson?.continuationContents?.liveChatContinuation?.viewerName
    }
  };

  interceptor.queue.selfChannel.set(user);
};

/** Updates the player progress of the queue of the interceptor. */
export const updatePlayerProgress = (playerProgress: number): void => {
  if (!isYtcInterceptor(interceptor, true, 'updatePlayerProgress', playerProgress)) return;
  interceptor.queue.updatePlayerProgress(playerProgress, true);
};

/**
 * Sets the theme of the interceptor, and sends the new theme to any currently
 * registered clients.
 */
export const setTheme = (dark: boolean): void => {
  if (!isYtcInterceptor(interceptor, true, 'setTheme', dark)) return;

  interceptor.dark = dark;
  interceptor.clients.forEach(
    (port) => port.postMessage({ type: 'themeUpdate', dark })
  );
};

/** Returns a message with the theme of the interceptor. */
const getTheme = (port: Chat.Port): void => {
  if (!isYtcInterceptor(interceptor, true, 'getTheme', port)) return;

  port.postMessage({ type: 'themeUpdate', dark: interceptor.dark });
};

// TODO: Figure this out when doing MV3 for LTL
const sendLtlMessage = (message: Chat.LtlMessage): void => {
  interceptor.clients.forEach(
    (clientPort) => clientPort.postMessage({ type: 'ltlMessage', message })
  );
};

const executeChatAction = async (
  message: Ytc.ParsedMessage,
  ytcfg: YtCfg,
  action: ChatUserActions,
  reportOption?: ChatReportUserOptions,
  timeoutOption?: ChatTimeoutOptions
): Promise<void> => {
  if (message.params == null) return;

  const fetcher = async (...args: any[]): Promise<any> => {
    return await new Promise((resolve) => {
      const encoded = JSON.stringify(args);
      window.addEventListener('proxyFetchResponse', (e) => {
        const response = JSON.parse((e as CustomEvent).detail);
        resolve(response);
      });
      window.dispatchEvent(new CustomEvent('proxyFetchRequest', {
        detail: encoded
      }));
    });
  };

  let success = true;
  let showResult = false;
  try {
    const apiKey = ytcfg.data_.INNERTUBE_API_KEY;
    const contextMenuUrl = `${currentDomain}/youtubei/v1/live_chat/get_item_context_menu?params=` +
      `${encodeURIComponent(message.params)}&pbj=1&key=${apiKey}&prettyPrint=false`;
    const baseContext = ytcfg.data_.INNERTUBE_CONTEXT;
    function getCookie(name: string): string {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return (parts.pop() ?? '').split(';').shift() ?? '';
      return '';
    }
    const time = Math.floor(Date.now() / 1000);
    const SAPISID = getCookie('__Secure-3PAPISID');
    const sha = sha1(`${time} ${SAPISID} ${currentDomain}`);
    const auth = `SAPISIDHASH ${time}_${sha}`;
    const heads = {
      headers: {
        'Content-Type': 'application/json',
        Accept: '*/*',
        Authorization: auth
      },
      method: 'POST'
    };
    const res = await fetcher(contextMenuUrl, {
      ...heads,
      body: JSON.stringify({ context: baseContext })
    });
    function parseServiceEndpoint(serviceEndpoint: any, prop: string): { params: string, context: any } {
      const { clickTrackingParams, [prop]: { params } } = serviceEndpoint;
      const clonedContext = JSON.parse(JSON.stringify(baseContext));
      clonedContext.clickTracking = {
        clickTrackingParams
      };
      return {
        params,
        context: clonedContext
      };
    }

    let menuItems: {[k: string]: any} = {};
    for (const menuItem of res.liveChatItemContextMenuSupportedRenderers.menuRenderer.items) {
      const renderer = (menuItem.menuNavigationItemRenderer != undefined ? menuItem.menuNavigationItemRenderer : menuItem.menuServiceItemRenderer);
      const icon= renderer.icon.iconType;
      menuItems[icon] = renderer;
    }

    if (action === ChatUserActions.CHECK_BANNED) {
      console.log('checkIsBannedResponse', ChatUserActions.UNBAN in menuItems);
      interceptor.clients.forEach(
        (clientPort) => clientPort.postMessage({
          type: 'checkIsBannedResponse',
          action: action,
          message,
          isBanned: ChatUserActions.UNBAN in menuItems
        })
      );
    } else if (action === ChatUserActions.BLOCK) {
      showResult = true;
      const { params, context } = parseServiceEndpoint(
        menuItems[ChatUserActions.BLOCK].navigationEndpoint.confirmDialogEndpoint
          .content.confirmDialogRenderer.confirmButton.buttonRenderer.serviceEndpoint,
        'moderateLiveChatEndpoint'
      );
      await fetcher(`${currentDomain}/youtubei/v1/live_chat/moderate?key=${apiKey}&prettyPrint=false`, {
        ...heads,
        body: JSON.stringify({
          params,
          context
        })
      });
    } else if (action === ChatUserActions.REPORT_USER) {
      showResult = true;
      const { params, context } = parseServiceEndpoint(
        menuItems[ChatUserActions.REPORT_USER].serviceEndpoint,
        'getReportFormEndpoint'
      );
      const modal = await fetcher(`${currentDomain}/youtubei/v1/flag/get_form?key=${apiKey}&prettyPrint=false`, {
        ...heads,
        body: JSON.stringify({
          params,
          context
        })
      });
      const index = chatReportUserOptions.findIndex(d => d.value === reportOption);
      const options = modal.actions[0].openPopupAction.popup.reportFormModalRenderer.optionsSupportedRenderers.optionsRenderer.items;
      const submitEndpoint = options[index].optionSelectableItemRenderer.submitEndpoint;
      const clickTrackingParams = submitEndpoint.clickTrackingParams;
      const flagAction = submitEndpoint.flagEndpoint.flagAction;
      context.clickTracking = {
        clickTrackingParams
      };
      await fetcher(`${currentDomain}/youtubei/v1/flag/flag?key=${apiKey}&prettyPrint=false`, {
        ...heads,
        body: JSON.stringify({
          action: flagAction,
          context
        })
      });
    } else if (action === ChatUserActions.REMOVE || action === ChatUserActions.BAN || action === ChatUserActions.UNBAN) {
      const { params, context } = parseServiceEndpoint(
        menuItems[action].serviceEndpoint,
        'moderateLiveChatEndpoint'
      );
      const deleteBanResponse = await fetcher(`${currentDomain}/youtubei/v1/live_chat/moderate?key=${apiKey}&prettyPrint=false`, {
        ...heads,
        body: JSON.stringify({
          params,
          context
        })
      });
      processSentMessage(JSON.stringify(deleteBanResponse));
    } else if (action === ChatUserActions.TIMEOUT) {
      if (timeoutOption === undefined) {
        return;
      }
      const { params, context } = parseServiceEndpoint(
        menuItems[action].serviceEndpoint.signalServiceEndpoint.actions[0].openPopupAction.popup.showActionDialogRenderer.body.showActionDialogContentRenderer.content[0].formRenderer.fields[0].optionsRenderer.items[timeoutOption - 1].optionSelectableItemRenderer.submitEndpoint,
        'moderateLiveChatEndpoint'
      );
      const timeoutResponse = await fetcher(`${currentDomain}/youtubei/v1/live_chat/moderate?key=${apiKey}&prettyPrint=false`, {
        ...heads,
        body: JSON.stringify({
          params,
          context
        })
      });
      processSentMessage(JSON.stringify(timeoutResponse));
    }
  } catch (e) {
    console.debug('Error executing chat action', e);
    success = false;
  }

  if (showResult) {
    interceptor.clients.forEach(
      (clientPort) => clientPort.postMessage({
        type: 'chatUserActionResponse',
        action: action,
        message,
        success
      })
    );
  }
};

export const initInterceptor = (
  source: Chat.InterceptorSource,
  ytcfg: YtCfg,
  isReplayL?: boolean
): void => {
  if (source === 'ytc') {
    const queue = ytcQueue(isReplayL);
    isReplay.set(isReplayL);
    let queueUnsub: Unsubscriber | undefined;
    const ytcInterceptor: Chat.YtcInterceptor = {
      ...interceptor,
      source: 'ytc',
      dark: false,
      queue,
      queueUnsub
    };
    ytcInterceptor.queueUnsub = queue.latestAction.subscribe((latestAction) => {
      if (!latestAction) return;
      interceptor.clients.forEach((port) => port.postMessage(latestAction));
    });
    interceptor = ytcInterceptor;
  } else {
    interceptor.source = source;
  }

  chrome.runtime.onConnect.addListener((port) => {
    port.onMessage.addListener((message: Chat.BackgroundMessage) => {
      switch (message.type) {
        case 'registerClient':
          registerClient(port, message.getInitialData);
          break;
        case 'getTheme':
          getTheme(port);
          break;
        case 'sendLtlMessage':
          sendLtlMessage(message.message);
          break;
        case 'executeChatAction':
          executeChatAction(message.message, ytcfg, message.action, message.reportOption, message.timeoutOption).catch(console.error);
          break;
        case 'ping':
          port.postMessage({ type: 'ping' });
          break;
        default:
          console.error('Unknown message type', port, message);
          break;
      }
    });
  });
};
