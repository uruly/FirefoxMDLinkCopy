browser.action.onClicked.addListener(copyCurrentTabAsMarkdown);

async function copyCurrentTabAsMarkdown(tab) {
  if (!canCopyTab(tab)) {
    return;
  }

  try {
    const cleanUrl = await sanitizeUrl(tab.url);
    const markdown = `[${MDLinkCopyUrl.escapeMarkdownTitle(tab.title)}](${MDLinkCopyUrl.escapeMarkdownUrl(cleanUrl)})`;

    await navigator.clipboard.writeText(markdown);
    await showToast(tab.id, "コピーしました");
  } catch (error) {
    console.error("Failed to copy Markdown link:", error);
    await showToast(tab.id, "コピーできませんでした");
  }
}

function canCopyTab(tab) {
  return Boolean(
    tab &&
      Number.isInteger(tab.id) &&
      tab.title &&
      tab.url &&
      /^https?:\/\//.test(tab.url)
  );
}

async function sanitizeUrl(rawUrl) {
  const url = new URL(rawUrl);
  const settings = await browser.storage.local.get({
    removeParams: [...MDLinkCopyDefaults.removeParams],
    keepParams: [...MDLinkCopyDefaults.keepParams]
  });

  return MDLinkCopyUrl.sanitizeUrlWithRules(
    url.toString(),
    settings.removeParams,
    settings.keepParams
  );
}

async function showToast(tabId, message) {
  try {
    await browser.scripting.executeScript({
      target: { tabId },
      files: ["content/toast.js"]
    });

    await browser.scripting.executeScript({
      target: { tabId },
      func: (toastMessage) => {
        globalThis.MDLinkCopyShowToast?.(toastMessage);
      },
      args: [message]
    });
  } catch (error) {
    console.error("Failed to show toast:", error);
  }
}
