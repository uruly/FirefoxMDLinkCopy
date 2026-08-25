const removeParamsInput = document.getElementById("removeParams");
const keepParamsInput = document.getElementById("keepParams");
const optionsForm = document.getElementById("optionsForm");
const resetButton = document.getElementById("reset");
const statusText = document.getElementById("status");

optionsForm.addEventListener("submit", (event) => {
  event.preventDefault();
  saveOptions();
});

resetButton.addEventListener("click", resetOptions);

restoreOptions();

async function restoreOptions() {
  const settings = await browser.storage.local.get({
    removeParams: [...MDLinkCopyDefaults.removeParams],
    keepParams: [...MDLinkCopyDefaults.keepParams]
  });

  removeParamsInput.value = formatParams(settings.removeParams);
  keepParamsInput.value = formatParams(settings.keepParams);
}

async function saveOptions() {
  await browser.storage.local.set({
    removeParams: parseParams(removeParamsInput.value),
    keepParams: parseParams(keepParamsInput.value)
  });

  showStatus("保存しました");
}

async function resetOptions() {
  removeParamsInput.value = formatParams(MDLinkCopyDefaults.removeParams);
  keepParamsInput.value = formatParams(MDLinkCopyDefaults.keepParams);
  await saveOptions();
}

function parseParams(value) {
  return [...new Set(
    value
      .split("\n")
      .map((line) => line.trim().toLowerCase())
      .filter(Boolean)
  )].sort();
}

function formatParams(params) {
  if (!Array.isArray(params)) {
    return "";
  }

  return params.join("\n");
}

function showStatus(message) {
  statusText.textContent = message;

  setTimeout(() => {
    if (statusText.textContent === message) {
      statusText.textContent = "";
    }
  }, 1600);
}
