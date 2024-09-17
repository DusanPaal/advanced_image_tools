import React, { useState, useEffect, useReducer, useCallback } from 'react';
import axios from 'axios';

// input component
const InputWithLabel = ({
  id,
  type = 'text',
  value,
  onInputChange,
  children
}) => {

  return (
    <>
      <label htmlFor={id}>{children}</label>
      &nbsp;
      <input
        id={id}
        type={type}
        value={value}
        onChange={onInputChange}
      />
    </> 
  );

};

// item component
const Item = ({item, onRemoveClick}) => {

  return (
    <>
      <li key={item.id}>{item.title}</li>
      <button type="button" onClick={() => onRemoveClick(item)}>
          Remove
      </button>
    </>
  );

};

// list component
const List = ({ list, removeItemHandler }) => {

  return (
    <ul>
      {list.map((item) => <Item
        key={item.id}
        item={item}
        onRemoveClick={removeItemHandler}
      />)}
    </ul>

  );

};


const App = () => {

  const API_ENDPOINT = 'https://hn.algolia.com/api/v1/search?query=';

  // custom hook for local storage
  const useStorageState = (key, initialState) => {

    const [value, setValue] = useState(
      localStorage.getItem(key) || initialState
    );

    useEffect(() => {
      localStorage.setItem(key, value);
    }, [value]);

    return [value, setValue];

  };

  // custom reducer 
  const storiesReducer = (state, action) => {
    switch (action.type) {
      case 'STORIES_FETCH_INIT':
        return {
          ...state,
          isLoading: true,
          isError: false
        };
      case 'STORIES_FETCH_SUCCESS':
        return {
          ...state,
          isError: false,
          isLoading: false,
          data: action.payload
        };
      case 'STORIES_FETCH_FAILURE':
        return {
          ...state,
          isError: true,
          isLoading: false,
          errorMsg: action.payload
        };
      case 'REMOVE_STORY':
        return {
          ...state,
          data: state.data.filter(
            (story) => story.id !== action.payload.id)
        };
      case 'CLEAR_STORIES':
        return {
          ...state,
          data: []
        }
      default:
        throw new Error(`Action type '${action.type}' not implemented!`);
    }
  };

  // state management
  const [stories, dispatchStories] = useReducer(storiesReducer, { data: [], isLoading: false, isError: false, errorMsg: ''});
  const [searchTerm, setSearchTerm] = useStorageState('search', '');
  const [url, setUrl] = useState(`${API_ENDPOINT}${searchTerm}`)

  // event handlers
  const handleRemoveItem = (item) => {
    dispatchStories({
      type: 'REMOVE_STORY',
      payload: item
    });
  };

  const handleSearchInput = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = () => {
    setUrl(`${API_ENDPOINT}${searchTerm}`)
	};

  // read data from a database
  const handleFetchStoriesA = useCallback(() => {

    if (!searchTerm) return;

    dispatchStories({ type: 'STORIES_FETCH_INIT' });

    axios
      .get(url) // fetch(url) // used with fetch API
      //.then((response) => response.json()) // used with fetch API
      .then((result) => {
        dispatchStories({
          type: 'STORIES_FETCH_SUCCESS',
          payload: result.data.hits // result.data.hits // used with fetch API
        });
      })
      .catch((error) =>
        dispatchStories({
          type: 'STORIES_FETCH_FAILURE',
          payload: `Error while fetching data: ${error.message}!`
        }));
  }, [url]);

  const handleFetchStoriesB = useCallback(async () => {

    if (!searchTerm) return;

    dispatchStories({ type: 'STORIES_FETCH_INIT' });

    try {

      const result = await axios.get(url);

      dispatchStories({
        type: 'STORIES_FETCH_SUCCESS',
        payload: result.data.hits
      });

    } catch {
      dispatchStories({
        type: 'STORIES_FETCH_FAILURE',
        payload: `Error while fetching data: ${error.message}!`
      });
    }

  }, [url]);

  useEffect(() => {
    handleFetchStoriesB();
  }, [handleFetchStoriesB]);

  return (
    <>

      <InputWithLabel
        id='search'
        label='Search: '
        value={searchTerm}
        onInputChange={handleSearchInput}
      ><strong>Search: </strong>
      </InputWithLabel> 

      <button
        type='button'
        onClick={handleSearchSubmit}
        disabled={!searchTerm}
      >
        Submit
      </button>

      <br />

      {stories.isLoading ? (
        <p>Loading ...</p>
      ) : (
        <List 
          list={stories.data} 
          removeItemHandler={handleRemoveItem} 
        />
      )}

      {stories.isError && <p>{stories.errorMsg}</p>}

    </>
  );

};

export default App;