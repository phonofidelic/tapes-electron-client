import React, { ReactElement } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import { Recording } from '../common/Recording.interface';
import { RecorderState } from '../store/types';
import * as actions from '../store/actions';
import { connect } from 'react-redux';

interface Props {
  recording: Recording;
}

export function RecordingDetail({ recording }: Props): ReactElement {
  const history = useHistory();
  const { id } = useParams<{ id: string }>();

  console.log('RecordingDetail, recording:', recording);
  return (
    <div>
      <div>Recording Detail: {id}</div>
      <div>
        <Button
          variant="outlined"
          size="small"
          onClick={() => history.goBack()}
        >
          Back
        </Button>
      </div>
    </div>
  );
}

const mapStateToProps = (state: RecorderState) => {
  return {
    recording: state.selectedRecording,
  };
};

export default connect(mapStateToProps, actions)(RecordingDetail);
