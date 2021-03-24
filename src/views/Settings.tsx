import React, { useEffect } from 'react';
import { useTextile } from '../services/TextileProvider';

export default function Settings() {
  const { identity, getIdentity, getBucketKey } = useTextile();

  useEffect(() => {
    getBucketKey();
  }, []);
  return (
    <div>
      <div>Settigns View</div>
      <div>identity: {identity.toString()}</div>
    </div>
  );
}
