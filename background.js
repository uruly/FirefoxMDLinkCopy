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
      func: showToastInPage,
      args: [message]
    });
  } catch (error) {
    console.error("Failed to show toast:", error);
  }
}

function showToastInPage(message) {
  const existingToast = document.getElementById("mdlinkcopy-toast");

  if (existingToast) {
    existingToast.remove();
  }

  const toast = document.createElement("div");
  toast.id = "mdlinkcopy-toast";
  toast.textContent = message;
  toast.setAttribute("role", "status");

  Object.assign(toast.style, {
    position: "fixed",
    top: "24px",
    right: "24px",
    zIndex: "2147483647",
    padding: "10px 14px",
    borderRadius: "6px",
    background: "#202124",
    color: "#ffffff",
    fontSize: "14px",
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    lineHeight: "1.4",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.25)",
    opacity: "0",
    transform: "translateY(-6px)",
    transition: "opacity 160ms ease, transform 160ms ease"
  });

  document.documentElement.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity = "1";
    toast.style.transform = "translateY(0)";
  });

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(-6px)";

    setTimeout(() => {
      toast.remove();
    }, 180);
  }, 1600);
}
