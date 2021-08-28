import React, {
  ChangeEvent,
  ReactElement,
  useState,
  createRef,
  RefObject,
} from 'react';
import Paper from '@material-ui/core/Paper';
import InputBase from '@material-ui/core/InputBase';
import IconButton from '@material-ui/core/IconButton';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import SearchIcon from '@material-ui/icons/Search';
import SortIcon from '@material-ui/icons/Sort';
import CloseIcon from '@material-ui/icons/Close';
import Tooltip from '@material-ui/core/Tooltip';
import { Recording } from '../common/Recording.interface';

interface Props {
  searchLibrary(searchTerm: string): void;
  sortLibrary(sortBy: keyof Recording): void;
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

  const handleSortSelect = (
    event: ChangeEvent<{ name?: string; value: keyof Recording }>
  ) => {
    setSortBy(event.target.value);

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
        <IconButton onClick={() => inputRef.current.focus()}>
          <SearchIcon />
        </IconButton>
      ) : (
        <IconButton onClick={handleClearSearch}>
          <CloseIcon />
        </IconButton>
      )}
      <Tooltip title={`Sort by ${sortBy}`}>
        <IconButton onClick={toggleSortOpen}>
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
