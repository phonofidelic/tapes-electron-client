import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Recording } from '@/common/Recording.interface';
import { RecordingSettings } from '@/common/RecordingSettings.interface';
import { IpcService } from '@/IpcService';
import { useRecordings } from '@/contexts/RecordingsContext';
import { setLoadingMessage } from '@/store/actions';

export default function useRecorder(): [
  boolean,
  Error | null,
  {
    startRecording(recordingSettings: RecordingSettings): Promise<void>;
    stopRecording(): void;
    confirmError(): void;
  }
] {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const [, , , { addRecording }] = useRecordings();
  const dispatch = useDispatch();

  const ipc = new IpcService();

  const startRecording = async (recordingSettings: RecordingSettings) => {
    setIsRecording(true);
    let ipcResponse: { recordingData: Recording; file?: File; error?: Error };

    try {
      ipcResponse = await ipc.send('recorder:start', {
        data: { recordingSettings },
      });

      if (ipcResponse.error) {
        throw ipcResponse.error;
      }

      await addRecording(ipcResponse.recordingData);
      dispatch(setLoadingMessage(null));
    } catch (error) {
      console.error('Could not start recording:', error);
      setError(new Error('Could not start recording'));
      dispatch(setLoadingMessage(null));
    }
  };

  const stopRecording = () => {
    try {
      ipc.send('recorder:stop');
      setIsRecording(false);
      dispatch(setLoadingMessage('Storing file on IPFS...'));
    } catch (error) {
      setError(new Error('Could not stop recording'));
      dispatch(setLoadingMessage(null));
    }
  };

  const confirmError = () => {
    setError(null);
  };

  return [isRecording, error, { startRecording, stopRecording, confirmError }];
}
