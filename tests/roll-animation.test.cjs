const assert = require("node:assert/strict");
const fs = require("node:fs");
const ts = require("typescript");
const test = require("node:test");
const exported = {};
const source = fs.readFileSync("lib/roll-animation.ts", "utf8");
new Function(
  "exports",
  ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  }).outputText,
)(exported);
const { reelKeyframes, SPIN_DURATION } = exported;
const position = (frame) =>
  Number(frame.transform.match(/translateX\((.+)px\)/)[1]);

test("reel lands exactly on the target and only moves forward", () => {
  const frames = reelKeyframes(-416, -4576);
  assert.equal(position(frames[0]), -416);
  assert.equal(position(frames.at(-1)), -4576);
  assert.equal(frames.at(-1).filter, "blur(0.000px)");
  for (let i = 1; i < frames.length; i++) {
    assert.ok(position(frames[i]) <= position(frames[i - 1]));
    assert.ok(position(frames[i]) >= -4576);
    assert.ok(frames[i].offset > frames[i - 1].offset);
  }
});

test("motion accelerates and then coasts gently to a stop", () => {
  const frames = reelKeyframes(-416, -4576);
  const speed = (i) => position(frames[i - 1]) - position(frames[i]);
  assert.ok(speed(2) < speed(10));
  assert.ok(speed(40) > speed(80));
  assert.ok(speed(80) > speed(110));
  assert.ok(speed(120) < 0.01);
  assert.ok(SPIN_DURATION >= 5000);
});
