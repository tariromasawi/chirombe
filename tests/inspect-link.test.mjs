import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "fs";

test("the first index document links the live file inspection", () => {
  const html = fs.readFileSync("index.html", "utf8");
  const first = html.slice(0, html.indexOf("</html>"));
  assert.ok(first.includes('href="./inspect.html"'));
  assert.ok(first.includes('src="js/chirombe.js"'));
  const page = fs.readFileSync("inspect.html", "utf8");
  assert.ok(page.includes("https://github.com/tariromasawi/chirombe/blob/main/chirombe%20engine"));
  assert.ok(page.includes("chirombe%20engine"));
  assert.ok(!page.includes("<script src=\"../chirombe engine\""));
});
