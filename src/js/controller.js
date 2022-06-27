import * as model from './model.js';
import { isJSONparsable } from './helpers.js';
import { MODAL_CLOSE_SEC } from './config.js';
import RecipeView from './views/recipeView.js';
import SearchView from './views/searchView.js';
import ResultsView from './views/resultsView.js';
import PaginationView from './views/paginationView.js';
import BookmarksView from './views/bookmarksView.js';
import AddRecipeView from './views/addRecipeView.js';
import ExtraView from './views/extraView.js';
import CalendarView from './views/calendarView.js';
import DialogueWindowView from './views/dialogueWindowView.js';
import GetIdView from './views/getIdView.js';

import 'regenerator-runtime/runtime'; // it is for polyfilling async await
import 'core-js/stable'; // it is for polyfilling everything else
import { async } from 'regenerator-runtime';

///////////////////////////////////////
///////////////////////////// DISPLAYING RECIPE (ОТОБРАЖЕНИЕ РЕЦЕПТА) ///////////////////////////
/**
 * displays the recipe in the main window (отображает рецепт в главном окне)
 * @param {none}
 * @returns {undefined}
 * @author Jonas Shmedtmann (written by Dmitriy Vnuchkov)
 */
const controlRecipes = async function () {
  try {
    let id = window.location.hash.slice(1);
    if (!id) return;
    //Loading Spinner first (отображает спиннер загрузки)
    RecipeView.renderSpinner();
    //1 Update results view to mark selected search results (обновляет список рецептов, чтобы выделить выбранный)
    ResultsView.update(model.getSearchResultsPage());
    //2 Update bookmarksView too (обновляет список закладок для тех же целей)
    BookmarksView.update(model.state.bookmarks);
    //3 Load Recipe using ID (загружает данные рецепта через ID)
    await model.loadRecipe(id);
    //4 Render Recipe (рендерит рецепт)
    RecipeView.render(model.state.recipe);
  } catch (err) {
    RecipeView.renderError(err.message);
  }
};

///////////////////////////////////////
///////////////////////////// SEARCH RESULTS (РЕЗУЛЬТАТЫ ПОИСКА) ///////////////////////////
/**
 * sends a search request and then renders the search results and pagination buttons (запускает поиск, и затем отображает страницы результатов)
 * @param {none}
 * @returns {undefined}
 * @author Dmitriy Vnuchkov and Jonas Shmedtmann
 */
const controlSearchResults = async function () {
  try {
    //Spinner first, while the search is going (отображает спиннер загрузки)
    ResultsView.renderSpinner();
    //1 Get search query (подготавливает запрос)
    const query = SearchView.getQuery();
    if (!query) return;
    //2 Get search query resuts (получает результаты запроса)
    await model.loadSearchResults(query);
    //3 Render results (отображает результаты запроса)
    ResultsView.render(model.getSearchResultsPage());
    //4 Show buttons (выводит кнопки управления списками)
    ResultsView.showSortingBtns();
    //5 Render page buttons (выводит кнопки смены страниц с результатам поиска)
    PaginationView.render(model.state.search);
  } catch (err) {
    ResultsView.renderError(err.message);
  }
};

/**
 * changes page buttons and pages when user operates with the search results (перелистывает страницы с результатами поиска)
 * @param {number} new_page that is generates after click in the UI
 * @returns {undefined}
 * @author Jonas Shmedtmann (written by Dmitriy Vnuchkov)
 */
const controlPagination = function (newPage) {
  //1. Render NEW results when page is changed (отображает другие результаты при смене страницы)
  ResultsView.render(model.getSearchResultsPage(newPage));
  //2. Render NEW page buttons when page is changed (меняет контент кнопок управления страницами)
  PaginationView.render(model.state.search);
};

/**
 * it sorts the search results either according to the number of ingredients, or according to the cooking time (сортирует результаты поиска по количеству ингредиентов, или по длительности приготовления)
 * @param {boolean} boolean it depends on the pressed button in the UI
 * @returns {undefined}
 * @author Dmitriy Vnuchkov
 */
const controlSortRecipes = async function (bool) {
  try {
    //Spinner first, while the sorting is going (отображает спиннер загрузки)
    ResultsView.renderSpinner();
    //data is sorted (сортирует результаты)
    await model.sortResults(bool);
    //results are rendered using new data (отображает сортированные результаты)
    ResultsView.render(model.getSearchResultsPage());
    //pagination view is refreshed (обновляет кнопки перелистывания страниц)
    PaginationView.render(model.state.search);
  } catch (err) {
    ResultsView.renderError(err.message);
  }
};

///////////////////////////////////////
///////////////////////////// SERVINGS (ПОРЦИИ) ///////////////////////////
/**
 * changes the number of servings and values in each ingredient (изменяет количество порций и объема/количества() ингредиентов)
 * @param {number} of_servings chosen by the user
 * @returns {undefined}
 * @author Jonas Shmedtmann (written by Dmitriy Vnuchkov)
 */
const controlServings = function (servNum) {
  //Update the recipe servings (обновляет число порций)
  model.updateServings(servNum);
  //Update the recipe view (обновляет сам вид рецепта)
  RecipeView.update(model.state.recipe);
};

///////////////////////////////////////
///////////////////////////// BOOKMARKS (ЗАКЛАДКИ) ///////////////////////////

/**
 * adds/removes bookmark once the button is clicked in the main Recipe View (добавляет или снимает закладку с рецепта в главном окне)
 * @param {none}
 * @returns {undefined}
 * @author Jonas Shmedtmann (written by Dmitriy Vnuchkov)
 */
const controlAddBookmark = function () {
  //1. Add/Remove Bookmarks (добавляет или снимает закладку)
  !model.state.recipe.bookmarked ? model.addBookmark(model.state.recipe) : model.deleteBookmark(model.state.recipe.id);
  //2. Update RecipeView (обновляет вид рецепта)
  RecipeView.update(model.state.recipe);
  //3. Render/Update BookmarksView (обновляет вид закладок)
  BookmarksView.render(model.state.bookmarks);
};

/**
 * renders bookmarks once the page is loaded (рендерит закладки при загрузке страницы)
 * @param {none}
 * @returns {undefined}
 * @author Jonas Shmedtmann (written by Dmitriy Vnuchkov)
 */
const controlBookmarks = function () {
  BookmarksView.render(model.state.bookmarks);
};

/**
 * retrieves data from the form that user fills to add a recipe (выводит данные из формы при добавлении нового рецепта пользователем)
 * @param {object} recipe to upload
 * @returns {undefined}
 * @author Jonas Shmedtmann and Dmitriy Vnuchkov
 */
const controlAddRecipe = async function (newRecipe) {
  try {
    //load spinner and display the dialogue window (отображает спиннер загрузки)
    AddRecipeView.renderSpinner();
    //Upload new Recipe (выгружает новый рецепт)
    await model.uploadRecipe(newRecipe);
    //Success message (отображает сообщение об упехе)
    AddRecipeView.renderMessage(`Recipe has been successfully uploaded!`);
    //Render new recipe now (рендерит новый рецепт)
    RecipeView.render(model.state.recipe);
    //change ID in the URL - it helps to change the URL without reloading the page (меняет URL в поле с ссылкой)
    window.history.pushState(null, '', `#${model.state.recipe.id}`);
    //Render bookmarks (создает и рендерит закладку)
    BookmarksView.render(model.state.bookmarks);
    //return default form (возвращает изначальную форму для создания рецепта)
    AddRecipeView.returnUploadForm();
    //Close dialogue window (прячет диалоговое окно)
    setTimeout(function () {
      AddRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    AddRecipeView.renderError(err.message);
    console.log(err);
    //return default window (прячет диалоговое окно)
    AddRecipeView.returnUploadForm(true);
  }
};

////////////////////////////////////
//////////////////////// SHOPPING LIST ADDONS (СПИСОК ПОКУПОК) ////////////////////////

/**
 * retrieves the ingredients data from the main recipe window (including the num of servings) and renders the shopping list (выводит ингредиенты из рецепта в главном окне и создает список покупок)
 * @param {none}
 * @returns {undefined}
 * @author Dmitriy Vnuchkov
 */
const controlShoppingList = function () {
  //retrieve and render the shopping list (выводит список ингредиентов)
  const data = model.retrieveIngredients();
  //if there is no recipe - render the error message (показывает ошибку при отсутствии рецепта)
  if (typeof data === 'undefined') {
    DialogueWindowView.displayDialogueWindow();
    DialogueWindowView.renderError('Something went wrong. Please, choose and display the recipe that you want to shop for!');
    DialogueWindowView.setDefaultDialogueWindow();
    return;
  }
  //if there is a recipe - render the shopping list (отображает список покупок)
  ExtraView.renderShoppingList(data);
  //display message (показывает сообщение об успехе)
  DialogueWindowView.displayDialogueWindow();
  DialogueWindowView.renderMessage();
  //hide the dialogue window (скрывает диалоговое окно)
  DialogueWindowView.setDefaultDialogueWindow();
};

////////////////////////////////////
//////////////////////// WEEKLY PLAN ADDONS (ЕЖЕНЕДЕЛЬНОЕ МЕНЮ) ////////////////////////

/**
 * updates the weekly plan view using parameters from the CalendarView that help to identify the recipe to update (обновляет список блюд в меню используя параметры из CalendarView)
 * @param {none}
 * @returns {undefined}
 * @author Dmitriy Vnuchkov
 */
const controlCalendar = function () {
  //add the recipe to the weekly plan list in model.js (добавляет меню в список в model.js)
  model.updateCalendarList(CalendarView._curRecipe);
  //render in the UI (отображает изменения в UI)
  CalendarView.render(model.state.calendarList);
  //restore weekly plan default settings (обновляет настройки для работы с меню)
  CalendarView.defaultCalendarParameters();
};

/**
 * empties a certain weekly plan day (удаляет рецепт из выбранного дня в меню)
 * @param {number}
 * @returns {undefined}
 * @author Dmitriy Vnuchkov
 */
const controlEmptyCalendarDay = function (chosenDay) {
  model.emptyCalendarDay(chosenDay);
  CalendarView.render(model.state.calendarList);
};

/**
 * empties the entire weekly plan (опустошает меню полностью)
 * @param {none}
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
 * checks the transferred data and then renders updated weekly plan (проверяет переносимые данные, и затем обновляет вид меню)
 * @param {string} transferred_data the data that is dragged to the weekly plan window
 * @returns {undefined}
 * @author Dmitriy Vnuchkov
 */
const controlAddDraggedRecipe = function (data) {
  if (!isJSONparsable(data)) {
    CalendarView.returnToDefaultDraggingSettings();
    return;
  }
  //checks if the weekly plan day is the drop target, parses the data and sends to model (проверяет, является ли цель переноса днем в меню и переносит данные)
  if (CalendarView._draggedOverDay) model.updateCalendarList(+CalendarView._draggedOverDay.dataset.day, JSON.parse(data));
  //restores default weekly plan settings (обновляет настройки для работы с меню)
  CalendarView.returnToDefaultDraggingSettings();
  //renders the weekly plan (рендерит обновленное меню)
  CalendarView.render(model.state.calendarList);
};

/**
 * checks the transferred data and then renders the recipe in the main window (проверяет переносимые данные и отображает рецепт в главном меню)
 * @param {string} transferred_data the data that is dragged to the Recipe View
 * @returns {undefined}
 * @author Dmitriy Vnuchkov
 */
const controlDisplayRecipe = function (data) {
  if (!isJSONparsable(data) || Object.keys(JSON.parse(data)).length !== 2) return;
  //retrieves ID from the data and then changes the ID in hash, which initiates recipe rendering in the Recipe View (выводит ID рецепта и меняет URL в поле ссылки, что провоцирует сменю контента главной страницы)
  const id = JSON.parse(data).recipe.id;
  window.location.hash = id;
};

////////////////////////////////////
//////////////////////// CALORIES COUNTING (ПОДСЧЕТ КАЛОРИЙ ЧЕРЕЗ API) ////////////////////////

/**
 * makes an API call and renders the calories in a special window (производит запрос в API и отображает количество калорий в специальном поле)
 * @param {none}
 * @returns {undefined}
 * @author Dmitriy Vnuchkov
 */
const controlApi = async function () {
  try {
    if (Object.keys(model.state.recipe).length === 0)
      throw new Error('Something went wrong. Please, choose and display the recipe you want to analyze!');
    //render spinner first (отображает спиннер загрузки)
    DialogueWindowView.displayDialogueWindow();
    DialogueWindowView.renderSpinner();
    //make an AJAX call (совершает AJAX запрос)
    const totalCaloriesPerServing = await model.apiCall(model.state.recipe);
    DialogueWindowView.renderMessage('Calories have been successfully counted!');
    DialogueWindowView.setDefaultDialogueWindow();
    //display the number of Calories in the UI (отображает калории в UI)
    ExtraView.postCalories(totalCaloriesPerServing);
  } catch (err) {
    DialogueWindowView.displayDialogueWindow();
    DialogueWindowView.renderError(err.message);
    DialogueWindowView.setDefaultDialogueWindow();
  }
};

//////////////////////// NEW API KEY (НОВОЙ КЛЮЧ К API) ////////////////////////

/**
 * retrieves new key from the UI, stores it and updates the UI (получает введенный ключ, сохраняет, и обновляет UI)
 * @param {string} key entered by the user
 * @returns {boolean} depending on whether the key is the same or the field is empty
 * @author Dmitriy Vnuchkov
 */
const controlGenerateKey = function (newKey) {
  if (model.state.userKey === newKey || newKey.length === 0) {
    DialogueWindowView.displayDialogueWindow();
    DialogueWindowView.renderError(`Something went wrong. Please enter the Key and make sure it is new!`);
    DialogueWindowView.setDefaultDialogueWindow();
    return false;
  }
  model.saveNewKey(newKey);
  GetIdView.displayKeyNotification(model.state.userKey);
  //3. Render/Update BookmarksView (обновляет список закладок)
  BookmarksView.render(model.state.bookmarks);
  DialogueWindowView.displayDialogueWindow();
  DialogueWindowView.renderMessage(`A new Key has been successfully added to the application system!`);
  DialogueWindowView.setDefaultDialogueWindow();
  return true;
};

/**
 * deletes key from the model.state and renders a message (удаляет ключ и отображает оповещение)
 * @param {none}
 * @returns {undefined}
 * @author Dmitriy Vnuchkov
 */
const controlDeleteKey = function () {
  model.deleteKey();
  GetIdView.displayKeyNotification(model.state.userKey);
  //3. Render/Update BookmarksView (обновляет список закладок)
  BookmarksView.render(model.state.bookmarks);
  DialogueWindowView.displayDialogueWindow();
  DialogueWindowView.renderMessage(`The Key has been successfully deleted from the application system!`);
  DialogueWindowView.setDefaultDialogueWindow();
};

///////////////////////// INITIATING ALL THE LISTENERS AND DATA RETRIEVAL ////////////////////
///////////////////////// ВКЛЮЧАЕТ ВСЕ ПРИЕМНИКИ СОБЫТИЙ И ВЫВОДИТ ДАННЫЕ ИЗ ХРАНИЛИЩА ////////////////////

const init = function () {
  model.init2();
  GetIdView._addHandlerCheckKeyAtStart(model.state.userKey);
  CalendarView.renderCalendarAtStart(controlCalendar);
  BookmarksView.addHandlerRenderAtStart(controlBookmarks);
  RecipeView.addHandlerRender(controlRecipes);
  RecipeView.addHandlerAddBookmark(controlAddBookmark);
  RecipeView.addHandlerUpdateServings(controlServings);
  SearchView.addHandlerSearch(controlSearchResults);
  PaginationView.addHandlerClick(controlPagination);
  AddRecipeView.addHandlerUpload(controlAddRecipe);
  ResultsView.addHandlerSorting(controlSortRecipes);
  ExtraView.addHandlerShoppingList(controlShoppingList);
  CalendarView.addHandlerAddToCalendar(controlCalendar);
  CalendarView.addHandlerEmptyCalendarDay(controlEmptyCalendarDay);
  CalendarView.addHandlerEmptyCalendar(controlEmptyCalendar);
  CalendarView.addHandlerDropTo(controlAddDraggedRecipe);
  RecipeView.addHandlerDropTo(controlDisplayRecipe);
  ExtraView.addHandlerApi(controlApi);
  GetIdView.addHandlerAddNewKey(controlGenerateKey);
  GetIdView.addListenerConfirmDeleting(controlDeleteKey);
};

init();
