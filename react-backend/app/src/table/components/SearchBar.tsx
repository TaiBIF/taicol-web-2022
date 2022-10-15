import React from 'react'
import {TextField, IconButton, Box, Typography, Card, CardContent, SvgIcon} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search';

type Props = {
  handleSearch: (keyword: string) => void,
  placeholder?: string,
}

const SearchBar: React.VFC<Props> = (props) => {
  const { handleSearch, placeholder } = props

  const [keyword, setKeyword] = React.useState<string>('')

  return (
  <>
    <TextField
      id="search-bar"
      className="text"
      onInput={(e:React.ChangeEvent<HTMLInputElement>) => {
        setKeyword(e.target.value);
      }}
      label={"Search"}
      variant="outlined"
      placeholder={placeholder || ''}
      size="small"
    />
    <IconButton type="button" onClick={() =>handleSearch(keyword)} aria-label="search">
      <SearchIcon style={{ fill: "blue" }} />
    </IconButton>
    </>
  )
};

export default SearchBar
