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
  BLOCK = 'BLOCK',
  REPORT_USER = 'REPORT_USER',
  REMOVE = 'REMOVE',
  CHANNEL_ACTIVITY = 'CHANNEL_ACTIVITY',
  GO_TO_CHANNEL = 'GO_TO_CHANNEL',
  TIMEOUT = 'TIMEOUT',
  BAN = 'BAN',
  UNBAN = 'UNBAN',
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
  TEN_SEC = 'TEN_SEC',
  ONE_MIN = 'ONE_MIN',
  FIVE_MIN = 'FIVE_MIN',
  TEN_MIN = 'TEN_MIN',
  THIRTY_MIN = 'THIRTY_MIN',
  ONE_DAY = 'ONE_DAY'
}

export const chatTimeoutOptions = [
  { value: ChatTimeoutOptions.TEN_SEC, label: '10 seconds' },
  { value: ChatTimeoutOptions.ONE_MIN, label: '1 minute' },
  { value: ChatTimeoutOptions.FIVE_MIN, label: '5 minutes' },
  { value: ChatTimeoutOptions.TEN_MIN, label: '10 minutes' },
  { value: ChatTimeoutOptions.THIRTY_MIN, label: '30 minutes' },
  { value: ChatTimeoutOptions.ONE_DAY, label: '24 hours' }
];

export const chatUserActionsItems = [
  {
    value: ChatUserActions.CHANNEL_ACTIVITY,
    text: 'Channel Activity',
    icon: 'WATCH_HISTORY',
    iconType: 'YT_SVG',
    condition: [
      {
        isModerator: true
      }
    ]
  },
  {
    value: ChatUserActions.GO_TO_CHANNEL,
    text: 'Go to channel',
    icon: 'ACCOUNT_CIRCLE',
    iconType: 'YT_SVG',
    condition: [
      {
        isModerator: true
      }
    ]
  },
  {
    value: ChatUserActions.REPORT_USER,
    text: 'Report',
    icon: 'FLAG',
    iconType: 'YT_SVG',
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
    icon: 'NOT_INTERESTED',
    iconType: 'YT_SVG',
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
    icon: 'DELETE',
    iconType: 'YT_SVG',
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
    icon: 'HOURGLASS',
    iconType: 'YT_SVG',
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
    icon: 'REMOVE_CIRCLE',
    iconType: 'YT_SVG',
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
    icon: 'ADD_CIRCLE', 
    iconType: 'YT_SVG',
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
