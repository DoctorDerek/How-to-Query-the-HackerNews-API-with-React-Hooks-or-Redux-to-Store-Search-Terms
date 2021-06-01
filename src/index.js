import React, { useState } from "react"
import { createStore } from "redux"
import ReactDOM from "react-dom"

import { Provider, connect, useSelector, useDispatch } from "react-redux"

import "./styles.css"

const axios = require("axios")

function rootReducer(state = [], action) {
  switch (action.type) {
    case "ADD_SEARCH": {
      const { query } = action.payload
      return state.concat(query)
    }
    default:
      return state
  }
}

function App() {
  // React Hooks declarations
  const [results, setResults] = useState([])
  const [errors, setErrors] = useState("")
  const [searches, setSearches] = useState([])
  const [query, setQuery] = useState("")

  // React-Redux section
  const reduxSearches = useSelector((state) => state)
  const dispatch = useDispatch((query) => query)

  /**
   * A hit returned by HackerNews API:
   * @typedef {Component} Hit
   * @property {string} created_at Timestamp in format "2017-05-01T01:55:04.000Z"
   * @property {string} title
   * @property {string} url
   * @property {string} author
   * @property {integer} points
   */
  const Hit = ({ created_at, title, url, author, points }) => (
    <li>
      <a href="{url}">{title}</a> by {author} ({points} points) on{" "}
      {
        // Make timestamp readable by converting
        // "2017-05-01T01:55:04.000Z" to
        // "2017-05-01 at 01:55:04"
        created_at.replace("T", " at ").replace(".000Z", "")
      }
    </li>
  )

  const Search = ({ query }) => <li>{query}</li>

  const searchHackerNews = function accessAPI(query) {
    const encodedURI = window.encodeURI(
      // relevance-ordered
      `https://hn.algolia.com/api/v1/search?query=${query}`
      // or: date-ordered
      // `https://hn.algolia.com/api/v1/search_by_date?query=${query}`
    )

    function handleError(error) {
      console.warn(error)
      setErrors(error.toString())
      return null
    }

    const updateResults = (hits) => {
      // Update results state using React Hooks:
      setResults(hits)
    }

    // Make the call to the API using axios
    axios
      .get(encodedURI)
      .then(({ data }) => {
        updateResults(data.hits)
      })
      .catch(handleError)
  }

  const handleClick = () => {
    searchHackerNews(query)

    // Save search term state to React Hooks
    setSearches(searches.concat(query))

    // Save search term state using Redux
    dispatch({ type: "ADD_SEARCH", payload: { query } })
  }

  const updateQuery = (event) => {
    setQuery(event.target.value)
  }

  const keyPressed = (event) => {
    if (event.key === "Enter") {
      handleClick()
    }
  }

  const submitHandler = (e) => {
    e.preventDefault()
  }

  return (
    <div className="App">
      <h2>
        How to Query the HackerNews API with React Hooks or Redux to Store
        Search Terms
      </h2>

      {errors && <h3>{errors}</h3>}

      <form onSubmit={submitHandler}>
        <div>
          <input
            className="search-field-input"
            placeholder="Search HackerNews for..."
            type="text"
            onChange={updateQuery}
            onKeyPress={keyPressed}
          />
          <button
            className="search-field-button"
            type="button"
            onClick={handleClick}
          >
            Search
          </button>
        </div>
      </form>

      <hr />

      <h3>Previous searches: (React Hooks)</h3>
      <ul>
        {searches.length > 0 ? (
          searches.map((query, i) => (
            <Search
              query={query}
              // Prevent duplicate keys by appending index:
              key={query + i}
            />
          ))
        ) : (
          <li>
            <em>Searches will appear here</em>
          </li>
        )}
      </ul>

      <h3>
        Previous searches: <em>(Redux)</em>
      </h3>
      <ul>
        {reduxSearches.length > 0 ? (
          reduxSearches.map((query, i) => (
            <Search
              query={query}
              // Prevent duplicate keys by appending index:
              key={query + i}
            />
          ))
        ) : (
          <li>
            <em>Searches will appear here</em>
          </li>
        )}
      </ul>

      <hr />

      <h3>Search Results</h3>

      <ul className="searchResults">
        {results.map((hit, i) => (
          <Hit
            // HackerNews search hit returns 5 elements
            created_at={hit.created_at}
            title={hit.title}
            url={hit.url}
            author={hit.author}
            points={hit.points}
            // Prevent duplicate keys by appending index:
            key={hit.title + i}
          />
        ))}
      </ul>
    </div>
  )
}

export default connect()(App)

const rootElement = document.getElementById("root")

// Create store for Redux
const store = createStore(rootReducer)

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  rootElement
)
