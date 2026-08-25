const MDLinkCopyUrl = {
  sanitizeUrlWithRules(rawUrl, removeParams, keepParams) {
    const url = new URL(rawUrl);
    const removeSet = this.toParamSet(removeParams);
    const keepSet = this.toParamSet(keepParams);

    for (const key of [...url.searchParams.keys()]) {
      const normalizedKey = key.toLowerCase();

      if (keepSet.has(normalizedKey)) {
        continue;
      }

      if (removeSet.has(normalizedKey)) {
        url.searchParams.delete(key);
      }
    }

    return url.toString();
  },

  toParamSet(params) {
    if (!Array.isArray(params)) {
      return new Set();
    }

    return new Set(
      params
        .map((param) => String(param).trim().toLowerCase())
        .filter(Boolean)
    );
  },

  escapeMarkdownTitle(title) {
    return title
      .replaceAll("\\", "\\\\")
      .replaceAll("[", "\\[")
      .replaceAll("]", "\\]")
      .replaceAll("\n", " ");
  },

  escapeMarkdownUrl(url) {
    return url.replaceAll(")", "%29");
  }
};

globalThis.MDLinkCopyUrl = MDLinkCopyUrl;

if (typeof module !== "undefined") {
  module.exports = MDLinkCopyUrl;
}
