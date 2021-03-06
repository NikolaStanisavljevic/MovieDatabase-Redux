import React, { Component } from "react";
import MovieDatabase from "./MovieDatabase/MovieDatabase";
import Collection from "./Collection/Collection";
import ComingSoon from "./ComingSoon/ComingSoon";
import { Route } from "react-router-dom";
import axios from "axios";
import Autosuggest from "react-autosuggest";
import "./Main.css";

const moviesName = [];

// Teach Autosuggest how to calculate suggestions for any given input value.

const getSuggestions = value => {
  const inputValue = value.trim().toLowerCase();
  const inputLength = inputValue.length;

  return inputLength === 0
    ? []
    : moviesName.filter(
        lang => lang.toLowerCase().slice(0, inputLength) === inputValue
      );
};

// When suggestion is clicked, Autosuggest needs to populate the input
// based on the clicked suggestion. Teach Autosuggest how to calculate the
// input value for every given suggestion.

const getSuggestionValue = suggestion => suggestion;

// Use your imagination to render suggestions.

const renderSuggestion = suggestion => <div>{suggestion}</div>;

class Main extends Component {
  state = {
    movies: [],
    movie: [],
    error: false,
    value: "",
    suggestions: [],
    isOpen: false
  };

  // Get starting screen point (movie)

  componentDidMount() {
    const newMovie = [];
    axios
      .get(
        `https://api.themoviedb.org/3/search/movie?api_key=c14f219f034f43147391971bf0c07ba4&language=en-US&query=Moonlight&page=1&include_adult=false`
      )
      .then(response => {
        newMovie.push(response.data.results[0]);
        this.setState({
          movie: newMovie
        });
      })
      .catch(error => {
        this.setState({
          error: true
        });
      });
  }

  //Handle navbar click

  toggle = () => {
    this.setState({
      isOpen: !this.state.isOpen
    });
  };

  // Add movie to collection on button click

  addMovie = movie => {
    const newMovies = [...this.state.movies];
    newMovies.push(this.state.movie);
    this.setState({
      movies: newMovies
    });
  };

  // Handle suggestion click

  onSuggestionSelected = (
    event,
    { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }
  ) => {
    const newMovie = [];
    if (method === "click") {
      axios
        .get(
          `https://api.themoviedb.org/3/search/movie?api_key=c14f219f034f43147391971bf0c07ba4&language=en-US&query=${suggestion}&page=1&include_adult=false`
        )
        .then(response => {
          newMovie.splice(0, 1, response.data.results[0]);
          this.setState({
            movie: newMovie,
            value: ""
          });
        })
        .catch(error => {
          this.setState({
            error: true
          });
        });
    }
  };

  onChange = (event, { newValue }) => {
    this.setState({
      value: newValue
    });
    if (this.state.value.length > 0) {
      axios
        .get(
          `https://api.themoviedb.org/3/search/movie?api_key=c14f219f034f43147391971bf0c07ba4&language=en-US&query=${
            this.state.value
          }&page=1&include_adult=false`
        )
        .then(response => {
          const movies = response.data.results;
          const moviesName = movies.map(name => {
            return name.title;
          });
          this.setState({ suggestions: moviesName });
        })
        .catch(error => {
          // Error
          if (error.response) {
            // The request was made and the server responded with a status code
            console.log(error.response.data);
          } else if (error.request) {
            // The request was made but no response was received
            console.log(error.request);
          } else {
            // Something happened in setting up the request that triggered an Error
            console.log("Error", error.message);
          }
        });
    }
  };

  // Autosuggest will call this function every time you need to update suggestions.
  // You already implemented this logic above, so just use it.

  onSuggestionsFetchRequested = ({ value }) => {
    this.setState({
      suggestions: getSuggestions(value)
    });
  };

  // Autosuggest will call this function every time you need to clear suggestions.

  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: []
    });
  };

  render() {
    const { value, suggestions } = this.state;

    // Autosuggest will pass through all these props to the input.

    const inputProps = {
      placeholder: "Type a movie name",
      value,
      onChange: this.onChange
    };

    return (
      // Passing props via react router

      <div>
        <Route
          path="/"
          exact
          render={() => (
            <MovieDatabase
              error={this.state.error}
              movies={this.state.movies}
              movie={this.state.movie}
              movieName={this.state.movieName}
              setMovie={this.setMovie}
              addMovie={this.addMovie}
              toggle={this.toggle}
              isOpen={this.state.isOpen}
            />
          )}
        />

        <Route
          path="/collection"
          exact
          render={() => (
            <Collection
              movies={this.state.movies}
              delete={this.deleteMovie}
              toggle={this.toggle}
              isOpen={this.state.isOpen}
            />
          )}
        />

        <Route
          path="/soon"
          exact
          render={() => (
            <ComingSoon toggle={this.toggle} isOpen={this.state.isOpen} />
          )}
        />

        <Autosuggest
          suggestions={suggestions.slice(0, 6)} //Get the number of suggestions
          onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
          onSuggestionsClearRequested={this.onSuggestionsClearRequested}
          getSuggestionValue={getSuggestionValue}
          renderSuggestion={renderSuggestion}
          inputProps={inputProps}
          onSuggestionSelected={this.onSuggestionSelected}
        />
      </div>
    );
  }
}

export default Main;
