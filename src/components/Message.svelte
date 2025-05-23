<script lang="ts">
  import { mdiGift } from '@mdi/js';
  import MessageRun from './MessageRuns.svelte';
  import Icon from './common/Icon.svelte';
  import Menu from './common/Menu.svelte';
  import {
    showProfileIcons,
    showUsernames,
    showTimestamps,
    showUserBadges,
    hoveredItem,
    port,
    isModerator,
    isReplay,
    selfChannelId
  } from '../ts/storage';
  import { chatUserActionsItems, Theme } from '../ts/chat-constants';
  import { useBanHammer } from '../ts/chat-actions';
  import type { Chat } from '../ts/typings/chat';

  export let message: Ytc.ParsedMessage;
  export let deleted: Chat.MessageDeletedObj | null = null;
  export let forceDark = false;
  export let hideName = false;
  export let hideDropdown = false;

  $: isDeleted = deleted != null || message.isModerationMessage;

  $: isBanned = message.isBanned ?? false;

  $: isSelf = message.author.id === $selfChannelId;

  const nameClass = 'font-bold tracking-wide align-middle';
  const generateNameColorClass = (member: boolean, moderator: boolean, owner: boolean, forceDark: boolean) => {
    if (owner && forceDark) {
      return 'text-owner-dark';
    } else if (owner) {
      return 'text-owner-light dark:text-owner-dark';
    } else if (moderator && forceDark) {
      return 'text-moderator-dark';
    } else if (moderator) {
      return 'text-moderator-light dark:text-moderator-dark';
    } else if (member && forceDark) {
      return 'text-member-dark';
    } else if (member) {
      return 'text-member-light dark:text-member-dark';
    } else if (forceDark) {
      return 'text-gray-500';
    } else {
      return 'text-gray-700 dark:text-gray-500';
    }
  };

  let member = false;
  let verified = false;
  let moderator = false;
  let owner = false;
  $: message.author.types.forEach((type) => {
    if (type === 'member') member = true;
    else if (type === 'verified') verified = true;
    else if (type === 'moderator') moderator = true;
    else if (type === 'owner') owner = true;
  });
  $: nameColorClass = generateNameColorClass(member, moderator, owner, forceDark);

  $: if (deleted != null) {
    if ($isModerator) {
      message.deletedMessage = deleted.replace;
    } else {
      message.message = deleted.replace;
    }
  }

  $: showUserMargin = $showProfileIcons || $showUsernames || $showTimestamps ||
    ($showUserBadges && (moderator || verified || member));

  export let forceTLColor: Theme = Theme.YOUTUBE;

  $: menuItems = chatUserActionsItems.filter((d) => {
    if (d.condition && d.condition.length > 0) {
      let hasOneCondition = false;
      for (const condition of d.condition) {
        let pass = true;
        if (condition.isModerator !== undefined && condition.isModerator !== $isModerator) {
          pass = false;
        }
        if (condition.isSelf !== undefined && condition.isSelf !== isSelf) {
          pass = false;
        }
        if (condition.isMessageRemoved !== undefined && condition.isMessageRemoved !== isDeleted) {
          pass = false;
        }
        if (condition.isReplay !== undefined && condition.isReplay !== $isReplay) {
          pass = false;
        }
        if (condition.isBanned !== undefined && condition.isBanned !== isBanned) {
          pass = false;
        }
        if (pass) {
          hasOneCondition = true;
        }
      }

      return hasOneCondition;
    }

    return true;
  }).map((d) => ({
    icon: d.icon,
    iconType: d.iconType,
    text: d.text,
    value: d.value.toString(),
    onClick: () => { useBanHammer(message, d.value, $port); }
  }));
</script>

<!-- svelte-ignore a11y-mouse-events-have-key-events -->
<div
  class="inline-flex flex-row gap-2 break-words w-full overflow-visible"
>
  {#if !hideName && $showProfileIcons && !message.isModerationMessage}
    <a
      href={message.author.url}
      class="flex-shrink-0 {message.author.url ? 'cursor-pointer' : 'cursor-auto'}"
      target="_blank"
    >
      <img
        class="h-5 w-5 inline align-middle rounded-full flex-none"
        src={message.author.profileIcon.src}
        alt={message.author.profileIcon.alt}
      />
    </a>
  {/if}
  <div>
    {#if !hideName}
      <span
        class="text-xs mr-1 text-gray-700 dark:text-gray-600 align-middle"
        class:hidden={!$showTimestamps}
      >
        {message.timestamp}
      </span>
      <a
        href={message.author.url}
        class:cursor-pointer={message.author.url}
        class:cursor-auto={!message.author.url}
        target="_blank"
      >
        <span
          class="{nameClass} {nameColorClass}"
          class:hidden={!$showUsernames}
        >
          {message.author.name}
        </span>
      </a>
      <span class="align-middle" class:hidden={!$showUserBadges}>
        {#if moderator}
          <Icon class="inline align-middle" small>build</Icon>
        {/if}
        {#if verified}
          <Icon
            class="inline align-middle text-gray-500"
            small
          >
            verified
          </Icon>
        {/if}
        {#if member && message.author.customBadge}
          <img
            class="h-4 w-4 inline align-middle"
            src={message.author.customBadge.src}
            alt={message.author.customBadge.alt}
            title={message.author.customBadge.alt}
          />
        {/if}
      </span>
      <span class="mr-1.5" class:hidden={!showUserMargin} />
    {/if}
    <MessageRun
      runs={message.message}
      deletedRuns={message.deletedMessage}
      {forceDark}
      deleted={isDeleted}
      {forceTLColor}
      class={message.membershipGiftRedeem ? 'text-gray-700 dark:text-gray-600 italic font-medium' : ''}
    />
    {#if message.membershipGiftRedeem}
      <svg
        height="1em"
        width="1em"
        viewBox="0 0 24 24"
        class="inline align-middle ml-1 text-gray-700 dark:text-gray-600"
        style="transform: translateY(-1px);"
      >
        <path d={mdiGift} fill="currentColor"/>
      </svg>
    {/if}
  </div>
  {#if !hideDropdown && !message.isModerationMessage && menuItems.length > 0}
    <Menu items={menuItems} visible={$hoveredItem === message.messageId} class="mr-2 ml-auto context-menu">
      <Icon slot="activator" style="font-size: 1.5em;">more_vert</Icon>
    </Menu>
  {/if}
</div>
