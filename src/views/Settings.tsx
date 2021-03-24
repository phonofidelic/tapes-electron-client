import React from 'react';
import { useTextile } from '../services/TextileProvider';

export default function Settings() {
  const { identity } = useTextile();

  return (
    <div>
      <div>Settigns View</div>
      <div>identity: {identity.toString()}</div>
    </div>
  );
}
