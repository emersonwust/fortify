import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { async } from 'regenerator-runtime';

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);
    if (!id) return;
    recipeView.renderSpinner();

    // 0) Update results view to mark selected search result
    resultsView.update(model.getSearchfResultsPage());

    // update bookmark view
    bookmarksView.update(model.state.bookmarks);

    // 1) Loading the recipe
    await model.loadRecipe(id);

    // 2) Rendering recipe
    recipeView.render(model.state.recipe);
  } catch (error) {
    recipeView.renderError();
  }
};

const controlSearchResults = async function () {
  try {
    // 1) Get search query
    const query = searchView.getQuery();
    if (!query) return;

    resultsView.renderSpinner();

    // 2) Load search results
    await model.loadSearchResults(query);

    // 3) Render results
    resultsView.render(model.getSearchfResultsPage());

    // 4) Render initial pagination buttons
    paginationView.render(model.state.search);
  } catch (error) {
    console.log(error);
    recipeView.renderError(error);
  }
};

const controlPagination = function (goToPage) {
  // Render new results
  resultsView.render(model.getSearchfResultsPage(goToPage));

  // Render new pagination buttons
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  // Update the recipe servings (in state)
  model.updateServings(newServings);

  // Update the Recipe view
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

const contolAddBookmark = function () {
  // 1) Add / Remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.delBookmark(model.state.recipe.id);

  // 2) update recipe view
  recipeView.update(model.state.recipe);

  // 3) Render bookmarks
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    // Show loading spinner
    addRecipeView.renderSpinner();

    // console.log(newRecipe);
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    // Render recipt
    recipeView.render(model.state.recipe);

    // Success message
    addRecipeView.renderMessage();

    // Render bookmarks
    bookmarksView.render(model.state.bookmarks);

    // Change ID in URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    // Close form window
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (error) {
    console.error('**', error);
    addRecipeView.renderError(error.message);
  }
};

const controlDeleteRecipe = async function (id) {
  try {
    // Show loading spinner
    addRecipeView.renderSpinner();

    // delete recipe in API
    await model.deleteRecipe(id);

    // delete Bookmark
    model.delBookmark(id);

    // update bookmark view
    bookmarksView.render(model.state.bookmarks);

    // Load search results
    await model.loadSearchResults(model.state.search.query);

    // Render results
    resultsView.render(model.getSearchfResultsPage());

    // Render initial pagination buttons
    paginationView.render(model.state.search);

    // Change ID in URL
    window.history.pushState(null, '', `#`);

    // Message to user, the user receipe deleted
    recipeView.renderMessage('Recipe has been deleted!');
  } catch (error) {
    addRecipeView.renderError(error.message);
  }
};

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(contolAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
  recipeView.addHandleDeleteRecipe(controlDeleteRecipe);
};
init();
