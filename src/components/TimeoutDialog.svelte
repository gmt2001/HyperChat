<script lang="ts">
  import type { ChatTimeoutOptions } from '../ts/chat-constants';
  import { chatTimeoutOptions } from '../ts/chat-constants';
  import {
    timeoutDialog
  } from '../ts/storage';
  import Dialog from './common/Dialog.svelte';
  import type { Writable } from 'svelte/store';
  import RadioGroupStore from './common/RadioGroupStore.svelte';
  import Button from 'smelte/src/components/Button';
  $: optionStore = $timeoutDialog?.optionStore as Writable<ChatTimeoutOptions>;
</script>

<Dialog active={Boolean($timeoutDialog)} class="max-w-full max-h-full" style="height: 500px; width: 500px;">
  <svelte:fragment slot="title">Timeout User</svelte:fragment>

  <div>
    <RadioGroupStore
      store={optionStore}
      items={chatTimeoutOptions}
      vertical
    />
  </div>

  <div slot="actions">
    <Button on:click={() => {
      $timeoutDialog?.callback($optionStore);
      $timeoutDialog = null;
    }} color="error" disabled={!$optionStore}>Timeout</Button>
  </div>
</Dialog>
