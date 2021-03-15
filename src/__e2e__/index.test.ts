import path from 'path';
import { Application } from 'spectron';

let app: Application;

beforeAll(async () => {
  app = new Application({
    path: path.join(
      __dirname,
      '..',
      '..',
      'out/tapes-electron-client-darwin-x64/tapes-electron-client.app/Contents/MacOS/tapes-electron-client'
    ),
    startTimeout: 15000,
  });

  await app.start();

  // app.browserWindow.show();
}, 15000);

afterAll(async function () {
  if (app && app.isRunning()) {
    await app.stop();
  }
});

test('displays the Recorder view', async function () {
  let windowCount = await app.client.getWindowCount();

  const text = await (await app.client.$('body')).getText();

  expect(windowCount).toBe(1);
  expect(text).toBe('REC');
});

test('displays the empty Storage view', async function () {
  const storageTab = await app.client.$('a[data-testid="nav-link_storage"]');
  await storageTab.click();

  const text = await (await app.client.$('body')).getText();

  expect(text).toBe('Your recordings will live here');
});

test('starts recording when the REC button is clicked', async () => {
  await (await app.client.$('a[data-testid="nav-link_recorder"]')).click();
  const startRecBtn = await app.client.$(
    'button[data-testid="button_start-rec"]'
  );

  await startRecBtn.click();

  expect(true).toBe(true);
});

test('stops recording when the STOP button is clicked', async () => {
  const stopRecBtn = await app.client.$(
    'button[data-testid="button_stop-rec"]'
  );

  await stopRecBtn.click();

  const text = await (await app.client.$('body')).getText();
  expect(text).toBe('REC');
});

test('can delete a recording', async () => {
  await (await app.client.$('a[data-testid="nav-link_storage"]')).click();

  await (
    await app.client.$('button[data-testid="button_recording-options"]')
  ).waitForExist({ timeout: 1000 });

  await (
    await app.client.$('button[data-testid="button_recording-options"]')
  ).click();

  await (
    await app.client.$('li[data-testid="option_delete-recording"]')
  ).click();

  await (await app.client.$('body')).waitForExist({ timeout: 5000 });

  const text = await (await app.client.$('body')).getText();
  expect(text).toBe('Your recordings will live here');
});
