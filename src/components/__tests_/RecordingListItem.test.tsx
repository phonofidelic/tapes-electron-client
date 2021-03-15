import React from 'react';
import '@testing-library/jest-dom';
import { render, fireEvent } from '@testing-library/react';
import { Recording } from '../../common/Recording.interface';
import { RecordingsListItem } from '../RecordingsListItem';

const mockDate = new Date();
const mockRecording: Recording = {
  id: '123',
  location: 'fdefafafaf',
  title: 'Mock recording',
  size: 1234,
  created: mockDate,
};

let mockSelect: (recordingId: string) => void;
let mockDelete: (recordingId: string) => void;
beforeEach(() => {
  mockSelect = jest.fn();
  mockDelete = jest.fn();
});

it('displays the default list item', () => {
  const { getByText } = render(
    <RecordingsListItem
      recording={mockRecording}
      selectedRecording={null}
      handleSelectRecording={mockSelect}
      handleDeleteRecording={mockDelete}
    />
  );

  expect(getByText('Mock recording')).toBeInTheDocument();
});

it('displays detail info when selected', () => {
  const { getByText } = render(
    <RecordingsListItem
      recording={mockRecording}
      selectedRecording={'123'}
      handleSelectRecording={mockSelect}
      handleDeleteRecording={mockDelete}
    />
  );

  expect(
    getByText(
      `${mockDate.toLocaleDateString()} ${mockDate.toLocaleTimeString()}`
    )
  ).toBeInTheDocument();

  expect(getByText('Size: 1.23 kB')).toBeInTheDocument();
});
