import * as model from './model.js';
import { isJSONparsable } from './helpers.js';
import { MODAL_CLOSE_SEC } from './config.js';
import RecipeView from './views/recipeView.js';
import SearchView from './views/searchView.js';
import ResultsView from './views/resultsView.js';
import PaginationView from './views/paginationView.js';
import BookmarksView from './views/bookmarksView.js';
import AddRecipeView from './views/addRecipeView.js';

//////////////////////////////// MY ADDONS /////////////////////////////////
import ExtraView from './views/extraView.js';
// import ShoppingListView from './views/shoppingListView.js';
import CalendarView from './views/calendarView.js';
import DialogueWindowView from './views/dialogueWindowView.js';
import GetIdView from './views/getIdView.js';
///////////////////////////////

import 'regenerator-runtime/runtime'; // it is for polyfilling async await
import 'core-js/stable'; // it is for polyfilling everything else
import { async } from 'regenerator-runtime';

///////////////////////////////////////
///////////////////////////// DISPLAYING RECIPE ///////////////////////////
/**
 * displays the recipe in the main window
 * @param {none}
 * @returns {undefined}
 * @author Jonas Shmedtmann
 */
const controlRecipes = async function () {
  try {
    let id = window.location.hash.slice(1);
    if (!id) return;
    //Loading Spinner first
    RecipeView.renderSpinner();
    //1 Update results view to mark selected search results
    ResultsView.update(model.getSearchResultsPage());
    //2 Update bookmarksView too
    BookmarksView.update(model.state.bookmarks);
    //3 Load Recipe using ID
    await model.loadRecipe(id);
    //4 Render Recipe
    RecipeView.render(model.state.recipe);
  } catch (err) {
    RecipeView.renderError(err.message);
  }
};

///////////////////////////////////////
///////////////////////////// SEARCH RESULTS ///////////////////////////
/**
 * sends a search request and then renders the search results and pagination buttons
 * @param {none}
 * @returns {undefined}
 * @author Jonas Shmedtmann
 */
const controlSearchResults = async function () {
  try {
    //Spinner first, while the search is going
    ResultsView.renderSpinner();
    //1 Get search query
    const query = SearchView.getQuery();
    if (!query) return;
    //2 Get search query resuts
    await model.loadSearchResults(query);
    //3 Render results
    ResultsView.render(model.getSearchResultsPage());
    //4 Show buttons
    ResultsView.showSortingBtns();
    //5 Render page buttons
    PaginationView.render(model.state.search);
  } catch (err) {
    ResultsView.renderError(err.message);
  }
};

/**
 * changes page buttons and pages when user operates with the search results
 * @param {number} new_page that is generates after click in the UI
 * @returns {undefined}
 * @author Jonas Shmedtmann
 */
const controlPagination = function (newPage) {
  //1. Render NEW results when page is changed
  ResultsView.render(model.getSearchResultsPage(newPage));
  //2. Render NEW page buttons when page is changed
  PaginationView.render(model.state.search);
};

/** MY ADDONS
 * it sorts the search results. Depending on the boolean, it sorts either according to the number of ingredients, or according to the cooking time
 * @param {boolean} boolean it depends on the pressed button in the UI
 * @returns {undefined}
 * @author Dmitriy Vnuchkov
 */
const controlSortRecipes = async function (bool) {
  try {
    //Spinner first, while the sorting is going
    ResultsView.renderSpinner();
    //data is sorted
    await model.sortResults(bool);
    //results are rendered using new data
    ResultsView.render(model.getSearchResultsPage());
    //pagination view is refreshed
    PaginationView.render(model.state.search);
  } catch (err) {
    ResultsView.renderError(err.message);
  }
};

///////////////////////////////////////
///////////////////////////// SERVINGS ///////////////////////////
/**
 * changes the number of servings and values in each ingredient
 * @param {number} of_servings chosen by the user
 * @returns {undefined}
 * @author Jonas Shmedtmann
 */
const controlServings = function (servNum) {
  //Update the recipe servings
  model.updateServings(servNum);
  //Update the recipe view
  RecipeView.update(model.state.recipe);
};

///////////////////////////////////////
///////////////////////////// BOOKMARKS ///////////////////////////

/**
 * adds/removes bookmark once the button is clicked in the main Recipe View
 * @param {none}
 * @returns {undefined}
 * @author Jonas Shmedtmann
 */
const controlAddBookmark = function () {
  //1. Add/Remove Bookmarks
  !model.state.recipe.bookmarked
    ? model.addBookmark(model.state.recipe)
    : model.deleteBookmark(model.state.recipe.id);
  //2. Update RecipeView
  RecipeView.update(model.state.recipe);
  //3. Render/Update BookmarksView
  BookmarksView.render(model.state.bookmarks);
};

/**
 * renders bookmarks once the page is loaded
 * @param {none}
 * @returns {undefined}
 * @author Jonas Shmedtmann
 */
const controlBookmarks = function () {
  BookmarksView.render(model.state.bookmarks);
};

/**
 * retrieves data from the form that user fills to add a recipe
 * @param {object} recipe to upload
 * @returns {undefined}
 * @author Jonas Shmedtmann and Dmitriy Vnuchkov
 */
const controlAddRecipe = async function (newRecipe) {
  try {
    //load spinner and display the dialogue window
    AddRecipeView.renderSpinner();
    //Upload new Recipe
    await model.uploadRecipe(newRecipe);
    //Success message
    AddRecipeView.renderMessage(`Recipe has been successfully uploaded!`);
    //Render new recipe now
    RecipeView.render(model.state.recipe);
    //change ID in the URL - it helps to change the URL without reloading the page
    window.history.pushState(null, '', `#${model.state.recipe.id}`);
    //Render bookmarks
    BookmarksView.render(model.state.bookmarks);
    //return default window
    AddRecipeView.returnUploadForm();
    // //Close dialogue window
    setTimeout(function () {
      AddRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    AddRecipeView.renderError(err.message);
    console.log(err);
    //return default window
    AddRecipeView.returnUploadForm(true);
  }
};

////////////////////////////////////
//////////////////////// SHOPPING LIST ADDONS ////////////////////////

/**
 * retrieves the ingredients data from the main recipe window (including the num of servings) and renders the shopping list
 * @param {none}
 * @returns {undefined}
 * @author Dmitriy Vnuchkov
 */
const controlShoppingList = function () {
  //retrieve and render the shopping list
  const data = model.retrieveIngredients();
  //if there is no recipe - render the error message
  if (typeof data === 'undefined') {
    DialogueWindowView.displayDialogueWindow();
    DialogueWindowView.renderError(
      'Something went wrong. Please, choose and display the recipe that you want to shop for!'
    );
    DialogueWindowView.setDefaultDialogueWindow();
    return;
  }
  //if there is a recipe - render the shopping list
  ExtraView.renderShoppingList(data);
  //display message
  DialogueWindowView.displayDialogueWindow();
  DialogueWindowView.renderMessage();
  //hide the dialogue window
  DialogueWindowView.setDefaultDialogueWindow();
};

////////////////////////////////////
//////////////////////// WEEKLY PLAN ADDONS ////////////////////////

/**
 * updates the weekly plan view using parameters from the CalendarView that help to identify the recipe to update
 * @param {none}
 * @returns {undefined}
 * @author Dmitriy Vnuchkov
 */
const controlCalendar = function () {
  //add the recipe to the weekly plan list in model.js
  model.updateCalendarList(CalendarView._curRecipe);
  //render in the UI
  CalendarView.render(model.state.calendarList);
  //restore weekly plan default settings
  CalendarView.defaultCalendarParameters();
};

/**
 *
 * @param {number} number the function that empties a certain weekly plan day
 * @returns {undefined}
 * @author Dmitriy Vnuchkov
 */
const controlEmptyCalendarDay = function (chosenDay) {
  model.emptyCalendarDay(chosenDay);
  CalendarView.render(model.state.calendarList);
};

/**
 *
 * @param {none} none the function that empties the entire weekly plan
 * @returns {undefined}
 * @author Dmitriy Vnuchkov
 */
const controlEmptyCalendar = function () {
  model.clearCalendar();
  DialogueWindowView.displayDialogueWindow();
  DialogueWindowView.renderMessage('Weekly Plan has been sucessfully emptied!');
  DialogueWindowView.setDefaultDialogueWindow();
  CalendarView.defaultCalendar();
};

/**
 * checks the transferred data and then renders updated weekly plan
 * @param {string} transferred_data the data that is dragged to the weekly plan window
 * @returns {undefined}
 * @author Dmitriy Vnuchkov
 */
const controlAddDraggedRecipe = function (data) {
  if (!isJSONparsable(data)) {
    CalendarView.returnToDefaultDraggingSettings();
    return;
  }
  //checks if the weekly plan day is the drop target, parses the data and sends to model
  if (CalendarView._draggedOverDay)
    //prettier-ignore
    model.updateCalendarList(+CalendarView._draggedOverDay.dataset.day, JSON.parse(data));
  // model.updateCalendarList(true, +CalendarView._draggedOverDay.dataset.day, JSON.parse(data));
  //restores default weekly plan settings
  CalendarView.returnToDefaultDraggingSettings();
  //renders the weekly plan
  CalendarView.render(model.state.calendarList);
};

/**
 * checks the transferred data and then renders the recipe in the main window
 * @param {string} transferred_data the data that is dragged to the Recipe View
 * @returns {undefined}
 * @author Dmitriy Vnuchkov
 */
const controlDisplayRecipe = function (data) {
  if (!isJSONparsable(data) || Object.keys(JSON.parse(data)).length !== 2)
    return;
  //retrieves ID from the data and then changes the ID in hash, which initiates recipe rendering in the Recipe View
  const id = JSON.parse(data).recipe.id;
  window.location.hash = id;
};

////////////////////////////////////
//////////////////////// CALORIES COUNTING ADDONS ////////////////////////

/**
 * makes an API call and renders the calories in a special window
 * @param {none}
 * @returns {undefined}
 * @author Dmitriy Vnuchkov
 */
const controlApi = async function () {
  try {
    if (Object.keys(model.state.recipe).length === 0)
      throw new Error(
        'Something went wrong. Please, choose and display the recipe you want to analyze!'
      );
    //render spinner first
    DialogueWindowView.displayDialogueWindow();
    DialogueWindowView.renderSpinner();
    //make an AJAX call
    const totalCaloriesPerServing = await model.apiCall(model.state.recipe);
    DialogueWindowView.renderMessage(
      'Calories have been successfully counted!'
    );
    DialogueWindowView.setDefaultDialogueWindow();
    //display the number of Calories in the UI
    ExtraView.postCalories(totalCaloriesPerServing);
  } catch (err) {
    DialogueWindowView.displayDialogueWindow();
    DialogueWindowView.renderError(err.message);
    DialogueWindowView.setDefaultDialogueWindow();
  }
};

////////////////////////ADDONS: NEW ID ////////////////////////

/**
 * retrieves new key from the UI, stores it and updates the UI
 * @param {string} key entered by the user
 * @returns {boolean} depending on whether the key is the same or the field is empty
 * @author Dmitriy Vnuchkov
 */
const controlGenerateKey = function (newKey) {
  if (model.state.userKey === newKey || newKey.length === 0) {
    DialogueWindowView.displayDialogueWindow();
    DialogueWindowView.renderError(
      `Something went wrong. Please enter the Key and make sure it is new!`
    );
    DialogueWindowView.setDefaultDialogueWindow();
    return false;
  }
  model.saveNewKey(newKey);
  GetIdView.displayKeyNotification(model.state.userKey);
  //3. Render/Update BookmarksView
  BookmarksView.render(model.state.bookmarks);
  DialogueWindowView.displayDialogueWindow();
  DialogueWindowView.renderMessage(
    `A new Key has been successfully added to the application system!`
  );
  DialogueWindowView.setDefaultDialogueWindow();
  return true;
};

/**
 * deletes key from the model.state and renders a message
 * @param {none}
 * @returns {undefined}
 * @author Dmitriy Vnuchkov
 */
const controlDeleteKey = function () {
  model.deleteKey();
  GetIdView.displayKeyNotification(model.state.userKey);
  //3. Render/Update BookmarksView
  BookmarksView.render(model.state.bookmarks);
  DialogueWindowView.displayDialogueWindow();
  DialogueWindowView.renderMessage(
    `The Key has been successfully deleted from the application system!`
  );
  DialogueWindowView.setDefaultDialogueWindow();
};

///////////////////////// INITIATING ALL THE LISTENERS AND DATA RETRIEVAL ////////////////////

const init = function () {
  //retrieves bookmarks and weekly plan data from the localStorage
  model.init2();
  // check if the key is there or not
  GetIdView._addHandlerCheckKeyAtStart(model.state.userKey);
  //it adds a listener to the DOM to render all weekly plan List recipes once the page is loaded
  CalendarView.renderCalendarAtStart(controlCalendar);
  //it adds a listener to the DOM to render all bookmark recipes previews once the page is loaded
  BookmarksView.addHandlerRenderAtStart(controlBookmarks);
  //it adds a listener to the DOM to render the recipe once the page is loaded or once the hash changes
  RecipeView.addHandlerRender(controlRecipes);
  //it adds a listener to the DOM to add/remove bookmark once we click the bookmark button
  RecipeView.addHandlerAddBookmark(controlAddBookmark);
  //it adds a listener to the buttons DOM to change the servings value
  RecipeView.addHandlerUpdateServings(controlServings);
  //it adds a listener to the DOM to render search results once we submit our query in the search panel
  SearchView.addHandlerSearch(controlSearchResults);
  //it adds a listener to the page buttons in DOM to change pages and update buttons
  PaginationView.addHandlerClick(controlPagination);
  //it adds a listener to the DOM to submit the newRecipe info
  AddRecipeView.addHandlerUpload(controlAddRecipe);

  //////////////////////// SEARCH RESULTS ADDONS ////////////////////////
  //it adds a listener to the sort btn to sort the recipes in the searchResults panel
  ResultsView.addHandlerSorting(controlSortRecipes);

  //////////////////////// UPLOAD RECIPE ADDONS ////////////////////////
  //it adds a listener to the addIng btn to add another line in the addRecipe modal window
  // AddRecipeView.addHandlerMoreIngredients(); // moved to the addRecipeView.js constructor

  //////////////////////// SHOPPING LIST ADDONS ////////////////////////
  //it adds a listener to the addToList btn to add all the ingredients from the recipe to the list
  ExtraView.addHandlerShoppingList(controlShoppingList);

  //////////////////////// WEEKLY PLAN ADDONS ////////////////////////
  //it adds a listener to the addToList btn to add a recipe to the weekly plan
  CalendarView.addHandlerAddToCalendar(controlCalendar);
  //it adds a listener to empty the chosen day
  CalendarView.addHandlerEmptyCalendarDay(controlEmptyCalendarDay);
  //it adds a listener to the emplyPlan btn to empty the weekly plan
  CalendarView.addHandlerEmptyCalendar(controlEmptyCalendar);
  //adds a listener to received the dropped data
  CalendarView.addHandlerDropTo(controlAddDraggedRecipe);
  // //add listeners to the main recipe window to allow dragged elements and make it draggable TESTING
  // RecipeView.addHandlerDraggable();
  // RecipeView.addHandlerDragEnd();
  // RecipeView.addHandlerDraggedOver(); TESTING
  RecipeView.addHandlerDropTo(controlDisplayRecipe);

  //////////////////////// CALORIES ADDONS ////////////////////////
  //adds a listener to the button to initiate AJAX call and rendering
  ExtraView.addHandlerApi(controlApi);

  //////////////////////// NEW ID ADDONS ////////////////////////
  //adds listeners to the key-related window and the confirmation window buttons
  GetIdView.addHandlerAddNewKey(controlGenerateKey);
  GetIdView.addListenerConfirmDeleting(controlDeleteKey);
};
init();

// Object.keys(window).forEach(key => {
//   if (/^on/.test(key)) {
//     window.addEventListener(key.slice(2), event => {
//       if (event.constructor.name !== 'KeyboardEvent') return;
//       console.log(event);
//     });
//   }
// });
