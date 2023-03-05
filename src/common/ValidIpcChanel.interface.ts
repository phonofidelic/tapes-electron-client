export type ValidIpcChanel =
  | 'recorder:start'
  | 'recorder:stop'
  | 'recorder:set-input'
  | 'storage:upload'
  | 'storage:cache_recording'
  | 'storage:get_recording_stats'
  | 'recordings:delete_one';
