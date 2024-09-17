import React, { useState, useEffect, useReducer } from 'react'

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
      <li key={item.id}>{item.brand}</li>
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

  // simulaates data from a database
  const initialCars = [
    { brand: 'Ford', id: 100 },
    { brand: 'Fiat', id: 101 },
    { brand: 'BMW', id: 102 },
    { brand: 'Audi', id: 103 }
  ];

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
  const carsReducer = (state, action) => {
    switch (action.type) {
      case 'CARS_FETCH_INIT':
				return {
					...state,
					isLoading: true,
					isError: false
				};
      case 'CARS_FETCH_SUCCESS':
        return {
          ...state,
          isError: false,
          isLoading: false,
          data: action.payload
        };
      case 'CARS_FETCH_FAILURE':
        return {
          ...state,
          isError: true,
          isLoading: false
        };
      case 'REMOVE_CAR':
        return {
          ...state,
          data: state.data.filter(
            (car) => car.id !== action.payload.id)
        };
      default:
        throw new Error(`Action type '${action.type}' not implemented!`);
    }
  };

  // state management
  const [cars, dispatchCars] = useReducer(carsReducer, { data: [], isLoading: false, isError: false });
  const [searchTerm, setSearchTerm] = useStorageState('search', 'keyword...');

  // data reader - simulates a slow network
  //const getAsyncData = () =>
  //  new Promise((resolve) => {
  //    setTimeout(
  //      () => resolve({ data: { cars: initialCars } }),
  //      2000 //timeout in seconds
  //    );
  //  });

  // data reader - simulates an error
  const getAsyncData = () =>
    new Promise((resolve, reject) => {
      setTimeout(reject, 2000 );
    });

  // event handlers
  const handleRemoveItem = (item) => {
    dispatchCars({
      type: 'REMOVE_CAR',
      payload: item
    });
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  // read data from a database
  useEffect(() => {
    dispatchCars({type: 'CARS_FETCH_INIT'});
    getAsyncData()
      .then(result => {
        dispatchCars({
          type: 'CARS_FETCH_SUCCESS',
          payload: result.data.cars
        });
        setIsLoading(false);
      })
      .catch(() =>
        dispatchCars({ type: 'CARS_FETCH_FAILURE' }));
  }, []);

  // filter the cars using the search term
  const foundCars = cars.data.filter((car) => {
    return car.brand.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <>

      <InputWithLabel
        id='search'
        label='Search: '
        value={searchTerm}
        onInputChange={handleSearch}
      ><strong>Search: </strong>
      </InputWithLabel> 
      <br />
      {cars.isLoading ? (
        <p>Loading ...</p>
      ) : (
/*        <strong>Result:</strong>*/
        <List 
          list={foundCars} 
          removeItemHandler={handleRemoveItem} 
        />
      )}
      {cars.isError && <p>An error occured while loading data</p>}

    </>
  );

};

export default App;