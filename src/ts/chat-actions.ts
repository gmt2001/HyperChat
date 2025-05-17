import { writable } from 'svelte/store';
import { ChatReportUserOptions, ChatTimeoutOptions, ChatUserActions } from './chat-constants';
import { reportDialog, timeoutDialog } from './storage';

export function useBanHammer(
  message: Ytc.ParsedMessage,
  action: ChatUserActions,
  port: Chat.Port | null
): void {
  if (action === ChatUserActions.REPORT_USER) {
    const store = writable(null as null | ChatReportUserOptions);
    reportDialog.set({
      callback: (selection) => {
        port?.postMessage({
          type: 'executeChatAction',
          message,
          action,
          reportOption: selection
        });
      },
      optionStore: store
    });
  } else if (action === ChatUserActions.TIMEOUT) {
    const store = writable(null as null | ChatTimeoutOptions);
    timeoutDialog.set({
      callback: (selection) => {
        port?.postMessage({
          type: 'executeChatAction',
          message,
          action,
          timeoutOption: selection
        });
      },
      optionStore: store
    });
  } else {
    port?.postMessage({
      type: 'executeChatAction',
      message,
      action
    });
  }
}
