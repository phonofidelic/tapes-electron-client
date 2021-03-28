import React, { useEffect } from 'react';
import { connect, useDispatch } from 'react-redux';
import * as actions from '../store/actions';
import { useTextile } from '../services/TextileProvider';
import { getBucketInfo } from '../effects';
import { RecorderState } from '../store/types';
import { SettingsApplicationsOutlined } from '@material-ui/icons';

interface SettingsProps {
  bucketInfo: any;
}

export function Settings({ bucketInfo }: SettingsProps) {
  const { identity } = useTextile();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getBucketInfo());
  }, []);

  return (
    <div>
      <div>Settigns View</div>
      <div>identity: {identity.toString()}</div>

      {/* {bucketInfo && (
        <>
          <div>
            <a href={bucketInfo.ipns} target="blank">
              ipns
            </a>
          </div>
          <div>
            <a href={bucketInfo.url}>url</a>
          </div>
          <div>
            <a href={bucketInfo.www} target="blank">
              www
            </a>
          </div>
        </>
      )} */}
    </div>
  );
}

const mapStateToProps = (state: RecorderState) => {
  return {
    bucketInfo: state.bucketInfo,
  };
};

export default connect(mapStateToProps, actions)(Settings);
