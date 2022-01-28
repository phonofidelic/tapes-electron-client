import React, {
  ChangeEvent,
  ReactElement,
  useState,
  createRef,
  RefObject,
} from 'react';
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';
import CloseIcon from '@mui/icons-material/Close';
import Tooltip from '@mui/material/Tooltip';
import { SelectChangeEvent } from '@mui/material';
import { Recording } from '../common/Recording.interface';

interface Props {
  searchLibrary(searchTerm: string): void;
  sortLibrary(sortBy: string): void;
}

export default function SearchBar({
  searchLibrary,
  sortLibrary,
}: Props): ReactElement {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOpen, setSortOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [sortBy, setSortBy] = useState<keyof Recording>('created');
  const inputRef: RefObject<HTMLInputElement> = createRef();

  const handleSearch = (value: string) => {
    console.log('value:', value);
    setSearchTerm(value);

    searchLibrary(value);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    searchLibrary('');
  };

  const handleSortSelect = (event: SelectChangeEvent<keyof Recording>) => {
    setSortBy(event.target.value as keyof Recording);

    sortLibrary(event.target.value);

    setSortOpen(false);
  };

  const handleCloseSortMenu = () => {
    setSortOpen(false);
  };

  const toggleSortOpen = () => {
    setSortOpen(!sortOpen);
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
        inputRef={inputRef}
        placeholder="Search the Library"
        inputProps={{ 'aria-label': 'search the library' }}
        value={searchTerm}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          handleSearch(e.target.value)
        }
      />
      {!searchTerm ? (
        <IconButton onClick={() => inputRef.current.focus()} size="large">
          <SearchIcon />
        </IconButton>
      ) : (
        <IconButton onClick={handleClearSearch} size="large">
          <CloseIcon />
        </IconButton>
      )}
      <Tooltip title={`Sort by ${sortBy}`}>
        <IconButton onClick={toggleSortOpen} size="large">
          <SortIcon />
        </IconButton>
      </Tooltip>
      {sortOpen && (
        <Select
          id="sort-menu"
          value={sortBy}
          onChange={handleSortSelect}
          open={true}
          onClose={handleCloseSortMenu}
          renderValue={() => <div></div>}
        >
          <MenuItem dense value="created">
            Created
          </MenuItem>
          <MenuItem dense value="duration">
            Duration
          </MenuItem>
          <MenuItem dense value="format">
            Format
          </MenuItem>
          <MenuItem dense value="title">
            Title
          </MenuItem>
        </Select>
      )}
    </Paper>
  );
}
