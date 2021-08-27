import React, { ChangeEvent, ReactElement, useState } from 'react';
import Paper from '@material-ui/core/Paper';
import InputBase from '@material-ui/core/InputBase';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';
import CloseIcon from '@material-ui/icons/Close';

interface Props {
  searchLibrary(searchTerm: string): void;
}

export default function SearchBar({ searchLibrary }: Props): ReactElement {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (value: string) => {
    console.log('value:', value);
    setSearchTerm(value);

    searchLibrary(value);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    searchLibrary('');
  };

  return (
    <Paper
      component="form"
      style={{
        display: 'flex',
        width: '100%',
      }}
    >
      <InputBase
        style={{ flex: 1, padding: 4 }}
        placeholder="Search the Library"
        inputProps={{ 'aria-label': 'search the library' }}
        value={searchTerm}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          handleSearch(e.target.value)
        }
      />
      {!searchTerm ? (
        <IconButton>
          <SearchIcon />
        </IconButton>
      ) : (
        <IconButton onClick={handleClearSearch}>
          <CloseIcon />
        </IconButton>
      )}
    </Paper>
  );
}
