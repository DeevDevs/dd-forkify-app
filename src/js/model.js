import { async } from 'regenerator-runtime';
import { API_URL, RES_PER_PAGE, SPOONACULAR_KEY, SPOONACULAR_URL } from './config.js';
import { AJAX } from './helpers.js';

export const state = {
  recipe: {},
  updatedQuantityValues: [],
  search: {
    query: '',
    results: [],
    sortedResults: [],
    page: 1,
    resultsPerPage: RES_PER_PAGE,
  },
  bookmarks: [],
  calendarList: [
    { day: 1, recipe: {} },
    { day: 2, recipe: {} },
    { day: 3, recipe: {} },
    { day: 4, recipe: {} },
    { day: 5, recipe: {} },
    { day: 6, recipe: {} },
    { day: 7, recipe: {} },
  ],
  userKey: '',
};

///////////////////////////////////////////
///////////////////////////// MAIN RECIPE FUNCTIONS ///////////////////////////

/**
 * format the received data into the format comfortable for our application (изменят полученные данные в формат удобный для приложения)
 * @param {Object} data the object with recipe data
 * @returns {Object} recipe in the proper format
 * @author Jonas Shmedtmann and Dmitriy Vnuchkov
 */
const createRecipeObject = function (data) {
  const { recipe } = data.data;
  recipe.ingredients.forEach(ing => {
    state.updatedQuantityValues.push(ing.quantity);
  });
  return (state.recipe = {
    id: recipe.id,
    title: recipe.title,
    publisher: recipe.publisher,
    sourceURL: recipe.source_url,
    image: recipe.image_url,
    servings: recipe.servings,
    cookingTime: recipe.cooking_time,
    ingredients: recipe.ingredients,
    ...(recipe.key && { key: recipe.key }),
  });
};

/**
 * send an AJAX call to get recipe data from the API (отправляет AJAX запрос чтобы получить данные с API)
 * @param {string} id the id to include into the AJAX call
 * @returns {undefined}
 * @author Jonas Shmedtmann
 */
export const loadRecipe = async function (id) {
  try {
    const data = await AJAX(`${API_URL}/${id}?key=${state.userKey}`);
    createRecipeObject(data);
    if (state.bookmarks.some(bookmark => bookmark.id === id)) {
      state.recipe.bookmarked = true;
    } else {
      state.recipe.bookmarked = false;
    }
  } catch (err) {
    throw err;
  }
};

///////////////////////////////////////////
///////////////////////////// SEARCH RELATED FUNCTIONS ///////////////////////////

/**
 * sends request to the API server and then receives and stores the result (отправляет запрос на API и обрабатывает полученные данные)
 * @param {string} search_words the key words to use for the search query
 * @returns {Array} it returns an array of properly retrieved objects/recipes
 * @author Jonas Shmedtmann
 */
export const loadSearchResults = async function (query) {
  try {
    state.search.query = query;
    const data = await AJAX(`${API_URL}?search=${query}&key=${state.userKey}`);
    state.search.results = data.data.recipes.map(rec => {
      return {
        id: rec.id,
        title: rec.title,
        publisher: rec.publisher,
        image: rec.image_url,
        ...(rec.key && { key: rec.key }),
      };
    });
    state.search.page = 1;
  } catch (err) {
    throw err;
  }
};

/**
 * generate pages of results for the resultsView (подготавливает данные результата поиска в постраничном формате)
 * @param {number} page_number the page that will be rendered in UI
 * @returns {Array} it returns an array with 10 objects/recipes
 * @author Jonas Shmedtmann
 */
export const getSearchResultsPage = function (page = state.search.page) {
  state.search.page = page;
  const start = (page - 1) * state.search.resultsPerPage;
  const end = page * state.search.resultsPerPage;
  return state.search.results.slice(start, end);
};

/** WITH MY ADDONS
 * changes the quantity of ingredients according to a new number of servings, and stores information about updates
 * @param {number} number_of_servings the one set by the user
 * @returns {undefined}
 * @author Jonas Shmedtmann and Dmitriy Vnuchkov
 */
export const updateServings = function (numServ) {
  state.updatedQuantityValues = [];
  state.recipe.ingredients.forEach(ing => {
    ing.quantity = (ing.quantity * numServ) / state.recipe.servings;
    state.updatedQuantityValues.push(ing.quantity);
  });
  state.recipe.servings = numServ;
};

/** MY ADDONS
 * sort the search results according to certain parameter
 * @param {boolean} boolean depending on the pressed button, certain type of sorting is triggered
 * @returns {array} array of sorted recipes
 * @author Dmitriy Vnuchkov
 */
export const sortResults = async function (bool) {
  try {
    const recipesToSort = state.search.results;
    //guard clause
    if (recipesToSort.length === 0) return;
    //page is refreshed
    state.search.page = 1;
    //a call is made to get additional information about the recipes
    const fullRecipes = await Promise.all(
      recipesToSort.map(result => {
        const data = AJAX(`${API_URL}/${result.id}?key=${state.userKey}`);
        return data;
      })
    );
    //sorting is done and the array is returned
    //prettier-ignore
    state.search.results = fullRecipes.map(obj => obj.data.recipe).sort((a, b) => bool
        ? a.cooking_time - b.cooking_time
        : a.ingredients.length - b.ingredients.length)
        .map(rec => {
          return {
            id: rec.id,
            title: rec.title,
            publisher: rec.publisher,
            image: rec.image_url,
            cookingTime: rec.cooking_time,
            ingredients: rec.ingredients,
            ...(rec.key && { key: rec.key }),
          };
        });
  } catch (err) {
    throw err;
  }
};

///////////////////////////////////////////
///////////////////////////// FUNCTIONS FOR BOOKMARKS ///////////////////////////

/**
 * store bookmarks data in the localStorage
 * @param {none}
 * @returns {undefined}
 * @author Jonas Shmedtmann
 */
const persistBookmarks = function () {
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
};

/**
 * bookmarks the displayed recipe
 * @param {object} recipe the recipe that has to be bookmarked
 * @returns {undefined}
 * @author Jonas Shmedtmann
 */
export const addBookmark = function (recipe) {
  //Add bookmark
  state.bookmarks.push(recipe);
  //Mark current recipe as bookmarked
  if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;
  //Save the bookmarks in the localStorage
  persistBookmarks();
};

/**
 * removes the bookmark from the displayed recipe
 * @param {string} id of the displayed recipe
 * @returns {undefined}
 * @author Jonas Shmedtmann
 */
export const deleteBookmark = function (id) {
  //Find index of the recipe we want to remove
  const index = state.bookmarks.findIndex(el => el.id === id);
  state.bookmarks.splice(index, 1);
  //Mark current recipe as NOT bookmarked
  if (id === state.recipe.id) state.recipe.bookmarked = false;
  //Save the bookmarks in the localStorage
  persistBookmarks();
};

const clearBookmarks = function () {
  localStorage.removeItem('bookmarks');
};
// clearBookmarks();

///////////////////////////////////////////
///////////////////////////// UPLOADING A RECIPE ///////////////////////////

/** WITH MY ADDONS
 * retrieves information from the submitted form, checks and organizes it, and then saves it in the API (AJAX call) and bookmarks
 * @param {object} new_recipe submitted by the user through the form
 * @returns {undefined}
 * @author Jonas Shmedtmann and Dmitriy Vnuchkov
 */
export const uploadRecipe = async function (newRecipe) {
  try {
    //all the ingredients are retrieved
    const ingredients = Object.entries(newRecipe)
      .filter(entry => entry[0].startsWith('ingredient'))
      .map(entry => [entry[0].split('Z'), entry[1]].flat(1));
    //and formatted
    let counter = 1;
    const allIng = [];

    ingredients.forEach((entry, i) => {
      if (counter === +entry[2]) {
        if (!isFinite(entry[3]) || ingredients[i + 2][3] === '') throw new Error('Wrong ingredient format! Please, use proper format.');
        allIng.push({
          quantity: +entry[3],
          unit: ingredients[i + 1][3].trim(),
          description: ingredients[i + 2][3].trim(),
        });
        counter++;
      }
    });
    //proper object with the recipe is created
    const recipe = {
      title: newRecipe.title,
      source_url: newRecipe.sourceUrl,
      image_url: newRecipe.image,
      publisher: newRecipe.publisher,
      cooking_time: +newRecipe.cookingTime,
      servings: +newRecipe.servings,
      ingredients: allIng,
    };
    //it is then stored in the API
    const data = await AJAX(`${API_URL}?key=${state.userKey}`, recipe);
    //formatted and stored in the state, posted
    state.recipe = createRecipeObject(data);
    //and bookmarked
    addBookmark(state.recipe);
  } catch (err) {
    throw err;
  }
};

/////////////////// FUNCTION THAT IS RUN AT THE PAGE LOAD (see Controller.js) ///////////////////////

/** WITH MY ADDONS
 * retrieves data about bookmarks. user key and the weekly plan from the localStorage
 * @param {object} recipe the recipe that has to be bookmarked
 * @returns {undefined}
 * @author Jonas Shmedtmann and Dmitriy Vnuchkov
 */
export const init2 = function () {
  const storedKey = localStorage.getItem('key');
  if (storedKey) state.userKey = JSON.parse(storedKey);
  const storage = localStorage.getItem('bookmarks');
  if (storage) state.bookmarks = JSON.parse(storage);
  const storedCalendar = localStorage.getItem('calendar');
  if (storedCalendar) state.calendarList = JSON.parse(storedCalendar);
};

///////////////////////////////////////////
///////////////////////////// CREATING A SHOPPING LIST ///////////////////////////
/** MY ADDONS
 * retrieves ingredients with chosen quantities to display in the shopping list
 * @param {none}
 * @returns {array} array of strings
 * @author Dmitriy Vnuchkov
 */
export const retrieveIngredients = function () {
  if (!state.recipe.ingredients) return;
  //retrieve and format each ingredient
  const arrayOfIngs = state.recipe.ingredients.map((ing, i) => {
    return `Item: ${ing.description.toUpperCase()}   ${
      state.updatedQuantityValues[i] ? `(amount: ${state.updatedQuantityValues[i]} ${ing.unit})` : ''
    }`;
  });
  return arrayOfIngs;
};

///////////////////////////////////////////
///////////////////////////// WEEKLY PLAN (CALENDAR) ///////////////////////////
/** MY ADDONS
 * empties the chosen calendar day in the state
 * @param {number} the_day to empty in the weekly plan
 * @returns {undefined}
 * @author Dmitriy Vnuchkov
 */
export const emptyCalendarDay = function (chosenDay) {
  state.calendarList.forEach(calendarDay => {
    if (calendarDay.day !== chosenDay) return;
    calendarDay.recipe = {};
  });
  persistCalendar();
};

/** MY ADDONS
 * updates the calendar depending on the parameters
 * @param {number} number of the day in the weekly plan that has to be targeted
 * @param {object} recipe that has to be used to update the calendar
 * @returns {undefined}
 * @author Dmitriy Vnuchkov
 */
export const updateCalendarList = function (recipeDay, newRecipe = state.recipe) {
  if (Object.keys(newRecipe).length === 0) return;
  if (Object.keys(newRecipe).length === 2) {
    state.calendarList.splice(newRecipe.day - 1, 1, {
      day: newRecipe.day,
      recipe: Object.keys(state.calendarList[recipeDay - 1].recipe).length > 0 ? state.calendarList[recipeDay - 1].recipe : {},
    });
    state.calendarList.splice(recipeDay - 1, 1, {
      day: recipeDay,
      recipe: newRecipe.recipe,
    });
  } else {
    state.calendarList.splice(recipeDay - 1, 1, {
      day: recipeDay,
      recipe: newRecipe,
    });
  }
  persistCalendar();
};

/** MY ADDONS
 * store weekly plan (calendar) data in the localStorage
 * @param {none}
 * @returns {undefined}
 * @author Dmitriy Vnuchkov
 */
const persistCalendar = function () {
  localStorage.setItem('calendar', JSON.stringify(state.calendarList));
};

/**
 * empties the weekly plan object and the localStorage data
 * @param {none}
 * @returns {undefined}
 * @author Dmitriy Vnuchkov
 */
export const clearCalendar = function () {
  state.calendarList = [
    { day: 1, recipe: {} },
    { day: 2, recipe: {} },
    { day: 3, recipe: {} },
    { day: 4, recipe: {} },
    { day: 5, recipe: {} },
    { day: 6, recipe: {} },
    { day: 7, recipe: {} },
  ];
  localStorage.removeItem('calendar');
};
// clearCalendar();

///////////////////////////////////////////
///////////////////////////// CALORIES COUNTER API ///////////////////////////
/** MY ADDONS
 * retrieves ingredients from the recipe and gains info about them from Spoonacular, then - displays calories per serving
 * @param {object} recipe to analyze in the spoonacular
 * @returns {number} number of calories per serving
 * @author Dmitriy Vnuchkov
 * @todo add the spinner while the AJAX call is made
 */
export const apiCall = async function (recipe) {
  try {
    //prepare the recipe for the AJAX call
    const recipeToSend = {
      title: recipe.title,
      servings: recipe.servings,
      ingredients: recipe.ingredients.map(ing =>
        `${ing.quantity !== null ? `${ing.quantity} ${ing.unit} of ` : `1 ${ing.unit} of `} ${ing.description}`.replaceAll('  ', ' ').trim()
      ),
      instructions: '',
    };
    //make an AJAX call for ingredients' IDs and quantities
    //prettier-ignore
    const data = await AJAX(`${SPOONACULAR_URL}${SPOONACULAR_KEY}`, recipeToSend);
    //retrieve ingredients' IDs
    const ings = data.extendedIngredients.map(ing => {
      return {
        id: ing.id,
        amount: ing.measures.metric.amount,
        units: ing.measures.metric.unitLong,
      };
    });

    //make an AJAX call to get info about ingredients
    const ingredientData = await Promise.all(
      ings.map(ing => {
        if (ing.id) {
          const data = AJAX(`https://api.spoonacular.com/food/ingredients/${ing.id}/information?amount=${ing.amount}&${SPOONACULAR_KEY}`);
          return data;
        }
      })
    );
    //count total calories for all servings
    //prettier-ignore
    const calories = ingredientData
      .map(ingredient => ingredient.nutrition.nutrients.find(obj => obj.title === 'Calories'))
      .reduce((total, calories) => (total += calories.amount), 0);
    //count the calories per serving
    return Math.ceil(calories / recipe.servings);
  } catch (err) {
    throw err;
  }
};

/**
 * checks the key and stores it, updates bookmarks and the storage, if necessary
 * @param {string} key entered by the user
 * @returns {undefined}
 * @author Dmitriy Vnuchkov
 */
export const saveNewKey = function (newKey) {
  state.userKey = newKey;
  state.bookmarks = [];
  clearBookmarks();
  persistKey();
};

/**
 * deletes the key from the app memory and cleans up bookmarks list
 * @param {none}
 * @returns {undefined}
 * @author Dmitriy Vnuchkov
 */
export const deleteKey = function () {
  state.userKey = '';
  state.bookmarks = [];
  clearBookmarks();
  persistKey();
};

const persistKey = function () {
  localStorage.setItem('key', JSON.stringify(state.userKey));
};
