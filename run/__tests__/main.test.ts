import { Run } from "../src/run";
import { expect, test } from "@jest/globals";

test("throws empty script", async () => {
  await expect(Run("")).rejects.toThrow("script is empty!");
});

test("executes echo", async () => {
  await expect(Run('echo "test"')).resolves.toStrictEqual({
    exit: 0,
    stderr: "",
    stdout: "test",
    success: true,
  });
});

test("executes exit 1", async () => {
  await expect(Run("exit 1")).resolves.toStrictEqual({
    exit: 1,
    stderr: "",
    stdout: "",
    success: false,
  });
});

test("executes with pipes", async () => {
  await expect(Run('echo 3. apple" | grep apple')).resolves.toStrictEqual({
    exit: 0,
    stderr: "",
    stdout: "3. apple",
    success: true,
  });
});

test("executes script", async () => {
  await expect(
    Run(`
    echo "1" > test.out
    echo "2" >> test.out
    cat test.out
    `)
  ).resolves.toStrictEqual({
    exit: 0,
    stderr: "",
    stdout: "1\n2",
    success: true,
  });
});

test("unescape script", async () => {
  await expect(Run('echo 2" && echo 1')).resolves.toStrictEqual({
    exit: 0,
    stderr: "",
    stdout: "2",
    success: true,
  });
});
