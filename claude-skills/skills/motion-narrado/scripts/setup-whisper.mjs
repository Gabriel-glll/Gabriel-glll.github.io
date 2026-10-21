import {installWhisperCpp, downloadWhisperModel} from '@remotion/install-whisper-cpp';
import path from 'node:path';

const to = path.join(process.cwd(), 'whisper.cpp');
await installWhisperCpp({to, version: '1.5.5'});
await downloadWhisperModel({model: 'small', folder: to});
console.log('whisper ok');
