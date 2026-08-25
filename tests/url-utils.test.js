const assert = require("node:assert/strict");
const MDLinkCopyUrl = require("../shared/url-utils.js");

const removeParams = ["utm_source", "gad_source", "srsltid", "Source"];
const keepParams = ["id", "asin"];

assert.equal(
  MDLinkCopyUrl.sanitizeUrlWithRules(
    "https://example.com/article?id=123&utm_source=newsletter&gad_source=abc",
    removeParams,
    keepParams
  ),
  "https://example.com/article?id=123"
);

assert.equal(
  MDLinkCopyUrl.sanitizeUrlWithRules(
    "https://example.com/item?asin=B001&source=chatgpt",
    removeParams,
    keepParams
  ),
  "https://example.com/item?asin=B001"
);

assert.equal(
  MDLinkCopyUrl.sanitizeUrlWithRules(
    "https://example.com/item?source=product-source&id=999",
    ["source", "id"],
    ["source"]
  ),
  "https://example.com/item?source=product-source"
);

assert.equal(
  MDLinkCopyUrl.sanitizeUrlWithRules(
    "https://example.com/article?id=123&utm_source=x#section",
    removeParams,
    keepParams
  ),
  "https://example.com/article?id=123#section"
);

assert.equal(
  MDLinkCopyUrl.sanitizeUrlWithRules(
    "https://example.com/product?id=123&srsltid=abc",
    removeParams,
    keepParams
  ),
  "https://example.com/product?id=123"
);

assert.equal(
  MDLinkCopyUrl.escapeMarkdownTitle("A [title]\nwith slash \\"),
  "A \\[title\\] with slash \\\\"
);

assert.equal(
  MDLinkCopyUrl.escapeMarkdownUrl("https://example.com/search?q=a)"),
  "https://example.com/search?q=a%29"
);

console.log("url-utils tests passed");
