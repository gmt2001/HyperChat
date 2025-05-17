export const isLiveTL = false;
// DO NOT EDIT THE ABOVE LINE. It is updated by webpack.

export const enum Theme {
  YOUTUBE = 'YOUTUBE',
  LIGHT = 'LIGHT',
  DARK = 'DARK'
}

export const themeItems = [
  { value: Theme.YOUTUBE, label: 'Use YouTube theme' },
  { value: Theme.LIGHT, label: 'Light theme' },
  { value: Theme.DARK, label: 'Dark theme' }
];

export enum YoutubeEmojiRenderMode {
  SHOW_ALL = 'SHOW_ALL',
  BLOCK_SPAM = 'BLOCK_SPAM',
  HIDE_ALL = 'HIDE_ALL'
}

export const emojiRenderItems = [
  { value: YoutubeEmojiRenderMode.SHOW_ALL, label: 'Show all emojis' },
  { value: YoutubeEmojiRenderMode.BLOCK_SPAM, label: 'Hide emoji-only messages' },
  { value: YoutubeEmojiRenderMode.HIDE_ALL, label: 'Hide all emojis and emoji-only messages' }
];

export enum ChatUserActions {
  BLOCK = 'NOT_INTERESTED',
  REPORT_USER = 'FLAG',
  REMOVE = 'DELETE',
  TIMEOUT = 'HOURGLASS',
  BAN = 'REMOVE_CIRCLE',
  UNBAN = 'ADD_CIRCLE',
  CHECK_BANNED = 'CHECK_BANNED'
}

export enum ChatReportUserOptions {
  UNWANTED_SPAM = 'UNWANTED_SPAM',
  PORN_OR_SEX = 'PORN_OR_SEX',
  CHILD_ABUSE = 'CHILD_ABUSE',
  HATE_SPEECH = 'HATE_SPEECH',
  TERRORISM = 'TERRORISM',
  HARASSMENT = 'HARASSMENT',
  SUICIDE = 'SUICIDE',
  MISINFORMATION = 'MISINFORMATION',
}

export const chatReportUserOptions = [
  { value: ChatReportUserOptions.UNWANTED_SPAM, label: 'Unwanted commercial content or spam' },
  { value: ChatReportUserOptions.PORN_OR_SEX, label: 'Pornography or sexually explicit material' },
  { value: ChatReportUserOptions.CHILD_ABUSE, label: 'Child abuse' },
  { value: ChatReportUserOptions.HATE_SPEECH, label: 'Hate speech or graphic violence' },
  { value: ChatReportUserOptions.TERRORISM, label: 'Promotes terrorism' },
  { value: ChatReportUserOptions.HARASSMENT, label: 'Harassment or bullying' },
  { value: ChatReportUserOptions.SUICIDE, label: 'Suicide or self injury' },
  { value: ChatReportUserOptions.MISINFORMATION, label: 'Misinformation' }
];

export enum ChatTimeoutOptions {
  TEN_SEC = 0,
  ONE_MIN = 1,
  FIVE_MIN = 2,
  TEN_MIN = 3,
  THIRTY_MIN = 4,
  ONE_DAY = 5
}

export const chatTimeoutOptions = [
  { value: ChatTimeoutOptions.TEN_SEC, label: '10 seconds' },
  { value: ChatTimeoutOptions.ONE_MIN, label: '1 minute' },
  { value: ChatTimeoutOptions.FIVE_MIN, label: '5 minutes' },
  { value: ChatTimeoutOptions.TEN_MIN, label: '10 minutes' },
  { value: ChatTimeoutOptions.THIRTY_MIN, label: '30 minutes' },
  { value: ChatTimeoutOptions.ONE_DAY, label: '24 hours' }
];
/*
 * `condition` is an array of objects, defining when an action should be shown in the menu
 *
 * Conditions (keys) within an object are `AND`
 * 
 * Array entries are `OR`
 * 
 * The value of each condition in an object is a boolean, indicating whether the condition must be true or false
 * 
 * To ignore a supported condition for a particular case, it must not be defined
 *
 *  Supported conditions:
 *   - isSelf: If this message was sent by the current user
 *   - isModerator: If the current user is a moderator
 *   - isMessageRemoved: If this message was removed by any action (retracted, deleted, timeout, ban)
 *   - isReplay: If the current user is watching a replay, instead of a live stream
 *   - isBanned: If sender of this message is banned
 */
export const chatUserActionsItems = [
  {
    value: ChatUserActions.REPORT_USER,
    text: 'Report',
    icon: 'flag',
    condition: [
      {
        isSelf: false
      }
    ],
    messages: {
      success: 'The user has been reported for review by YouTube staff.',
      error: 'There was an error reporting the user. Please try again later.'
    }
  },
  {
    value: ChatUserActions.BLOCK,
    text: 'Block',
    icon: 'block',
    condition: [
      {
        isModerator: false,
        isSelf: false
      }
    ],
    messages: {
      success: 'The user has been blocked, and you will no longer see their messages. It may take several minutes for the setting to take full effect. You can unblock users in the settings panel at any time.',
      error: 'There was an error blocking the user. It is possible that this user has already been blocked. If not, please try again later.'
    }
  },
  {
    value: ChatUserActions.REMOVE,
    text: 'Remove',
    icon: 'trash-can-outline',
    condition: [
      {
        isModerator: true,
        isMessageRemoved: false
      },
      {
        isSelf: true,
        isMessageRemoved: false
      }
    ]
  },
  {
    value: ChatUserActions.TIMEOUT,
    text: 'Put user in timeout',
    icon: 'timer-sand',
    condition: [
      {
        isModerator: true,
        isReplay: false
      }
    ]
  },
  {
    value: ChatUserActions.BAN,
    text: 'Hide user on this channel',
    icon: 'minus-circle-outline',
    condition: [
      {
        isModerator: true,
        isBanned: false
      }
    ]
  },
  {
    value: ChatUserActions.UNBAN,
    text: 'Unhide user on this channel',
    icon: 'plus-circle-outline',
    condition: [
      {
        isModerator: true,
        isBanned: true
      }
    ]
  }
];

export const membershipBackground = '0f9d58';
export const milestoneChatBackground = '107516';
