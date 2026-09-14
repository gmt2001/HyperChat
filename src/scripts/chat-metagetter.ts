console.log('Dispatching fetchMeta event with ytcfg:', window.ytcfg);
window.dispatchEvent(new CustomEvent('fetchMeta', {
  detail: JSON.stringify(window.ytcfg)
}));

export {};
