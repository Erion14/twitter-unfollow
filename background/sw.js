// This is a service worker
// It will be used for storage and alarms.

chrome.runtime.onInstalled.addListener(() => {
  console.log('Twitter Unfollow extension installed.');
});
