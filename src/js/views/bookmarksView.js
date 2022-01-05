import View from './View.js';
import PreviewView from './previewView.js';

class BookmarksView extends View {
  _parentElement = document.querySelector('.bookmarks__list');
  _errorMessage = `No bookmarks yet. Find a nice recipe and bookmark it :)`;
  _successMessage = ``;

  addHandlerRenderAtStart(handler) {
    window.addEventListener('load', handler);
  }

  /**
   * previews of the recipes are generated in the PreviewView and are assembled here to get rendered
   * @param {none}
   * @returns {string} HTML code to render
   * @this {Object} bookmarks View instance
   * @author Jonas Shmedtmann
   */
  _generateMarkup() {
    return this._data
      .map(bookmark => PreviewView.render(bookmark, false))
      .join('');
  }
}

export default new BookmarksView();
