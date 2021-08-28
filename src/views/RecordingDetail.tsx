import React, { ReactElement } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import Button from '@material-ui/core/Button';

interface Props {}

export default function RecordingDetail({}: Props): ReactElement {
  const history = useHistory();
  const { id } = useParams<{ id: string }>();
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
