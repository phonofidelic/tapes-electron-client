import React, { useEffect } from 'react'
import { connect, useDispatch } from 'react-redux';
import { RecorderState } from '../store/types'
import { RecordingStorageStatus } from '../common/Recording.interface'
import effects from '../effects'

const { getRecordingStorageStatus } = effects

type Props = {
  recordingCid: string;
  storageStatus: RecordingStorageStatus;
  loading: boolean;
  error: Error
}

export function StorageStatusDisplay({ recordingCid, storageStatus, loading, error }: Props) {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getRecordingStorageStatus(recordingCid))
  }, [])

  if (error || !recordingCid) return <div>Could not retrieve storage status</div>
  if (loading || !storageStatus) return <div>Storage status: loading...</div>

  const pinnedCount = storageStatus.pins.filter((pin) => pin.status === 'Pinned').length
  return (
    <div>Storage status: {pinnedCount > 0 ? `pinned on ${pinnedCount} IPFS nodes` : `queued`}</div>
  )
}

const mapStateToProps = (state: RecorderState) => {
  return {
    storageStatus: state.selectedRecordingStorageStatus,
    loading: state.loading,
    recordingCid: state.selectedRecording.cid,
    error: state.error
  };
};

export default connect(mapStateToProps, null)(StorageStatusDisplay)