import path from 'path';
import util from 'util';
import https from 'https';
import { promises as fs, existsSync } from 'fs';
import { spawn } from 'child_process';
import axios from 'axios';
import appRootDir from 'app-root-dir';
import * as mm from 'music-metadata';
import { RecordingFormats } from '../common/RecordingFormats.enum';
import { MusicBrainzCoverArt } from '../common/MusicBrainzCoverArt.interface';
import { stdout } from 'process';

export const setStorageDir = async (folderName: string): Promise<string> => {
  const storagePath =
    process.env.NODE_ENV === 'production'
      ? path.resolve(process.resourcesPath, folderName)
      : path.resolve(folderName);

  if (!existsSync(storagePath)) {
    await fs.mkdir(storagePath);
  }
  return storagePath;
};

/**
 * https://stackoverflow.com/a/56569217/4677401
 */
// export const isValidRecordingFormat = (
//   format: string
// ): format is keyof typeof RecordingFormats => {
//   console.log('### FORMAT:', format, Object.values(RecordingFormats));
//   return format in RecordingFormats;
// };

/**
 * https://stackoverflow.com/a/47755096/4677401
 */
export const validRecordingFormat = (format: string): RecordingFormats => {
  if (!(<any>Object).values(RecordingFormats).includes(format)) {
    throw new Error('Recording format not supported');
  }

  return format as RecordingFormats;
};

export const getAcoustidResults = async (
  duration: number,
  fingerprint: string
) => {
  const acoustidRequestUrl = `https://api.acoustid.org/v2/lookup?client=${process.env.ACOUSTID_API_KEY
    }&meta=recordings+releasegroups+compress&duration=${Math.round(
      duration
    )}&fingerprint=${fingerprint}`;

  let acoustidResponse;
  try {
    acoustidResponse = await axios({
      method: 'GET',
      url: acoustidRequestUrl,
      httpsAgent: new https.Agent({
        host: 'api.acoustid.org',
        port: 443,
        path: '/',
        rejectUnauthorized: false,
      }),
    });

    console.log(
      '*** acoustidResponse:',
      util.inspect(acoustidResponse.data, true, 8, true)
    );

    return acoustidResponse;
  } catch (err) {
    console.error('Could not retreive Acoustid respone:', err);
    throw err;
  }
};

export const getMusicBrainzCoverArt = async (
  common: mm.ICommonTagsResult
): Promise<MusicBrainzCoverArt> => {
  let musicBrainzCoverArt;
  try {
    // if (!common.album) throw new Error('Missing album info');
    if (!common.album) return;
    const mbAlbumQueryResponse = await axios.get(
      `https://musicbrainz.org/ws/2/release-group?query=${common.album}&fmt=json`
    );

    const mbReleasseGroupId = mbAlbumQueryResponse.data['release-groups'][0].id;
    console.log('*** mbReleasseGroupId:', mbReleasseGroupId);

    const mbCoverArtResponse = await axios.get(
      `https://coverartarchive.org/release-group/${mbReleasseGroupId}`
    );

    console.log(
      '*** mbCoverArtResponse:',
      util.inspect(mbCoverArtResponse.data, true, 8, true)
    );
    musicBrainzCoverArt = mbCoverArtResponse.data.images[0];
  } catch (err) {
    console.error('Could not get album art:', err);
  }
  return musicBrainzCoverArt;
};

export const fpcalcPromise = (
  filePath: string
): Promise<{ duration: number; fingerprint: string }> =>
  new Promise((resolve, reject) => {
    const fpcalcPath =
      process.env.NODE_ENV === 'production'
        ? path.resolve(process.resourcesPath, 'bin', 'fpcalc')
        : path.resolve(appRootDir.get(), 'bin', 'fpcalc');

    const fpcalc = spawn(fpcalcPath, [filePath, '-json']);

    fpcalc.stdout.on('data', async (data) => {
      // console.log(data.toString())
      const { duration, fingerprint } = JSON.parse(data.toString());

      resolve({ duration, fingerprint });
    });

    fpcalc.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
      reject(new Error('Could not generate acoustic fingerprint'));
    });

    fpcalc.on('close', (code) => {
      console.log(`child process exited with code ${code}`);
      fpcalc.kill();
    });
  });

/**
 * https://stackoverflow.com/a/58571306
 */
export const spawnAsync = async (command: string, args: string[]) => {
  console.log(`Starting child process ${command} with args:`, args)
  const child = spawn(command, args)

  let data = '';
  for await (const chunk of child.stdout) {
    console.log(`${command} stdout:`, +chunk.toString())
    data += chunk
  }

  let error = ''
  for await (const chunk of child.stderr) {
    console.log(`${command} stderr:`, +chunk.toString())
    error += chunk
  }

  const exitCode = await new Promise((resolve, _reject) => {
    child.on('close', resolve)
  })

  if (exitCode) {
    throw new Error(`${command} error exit ${exitCode}, ${error}`)
  }

  return data
}