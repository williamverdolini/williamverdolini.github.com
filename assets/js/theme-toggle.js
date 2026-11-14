(function () {
  'use strict';

  var storageKey = 'williamverdolini.blog.theme';
  var validPreferences = ['system', 'light', 'dark'];
  var root = document.documentElement;
  var systemPreference = window.matchMedia('(prefers-color-scheme: dark)');
  var preference = 'system';

  try {
    var savedPreference = window.localStorage.getItem(storageKey);
    if (validPreferences.indexOf(savedPreference) !== -1) {
      preference = savedPreference;
    }
  } catch (error) {
    // The system preference remains available when browser storage is disabled.
  }

  function applyTheme() {
    var isDark = preference === 'dark' || (preference === 'system' && systemPreference.matches);
    root.setAttribute('data-theme', isDark ? 'dark' : 'light');
    root.style.colorScheme = isDark ? 'dark' : 'light';
    var themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) themeColor.setAttribute('content', isDark ? '#1d2220' : '#fff');
  }

  function savePreference(value) {
    if (validPreferences.indexOf(value) === -1) return;
    preference = value;
    try {
      window.localStorage.setItem(storageKey, preference);
    } catch (error) {
      // Keep the selected theme for the current page even without browser storage.
    }
    applyTheme();
  }

  applyTheme();
  systemPreference.addEventListener('change', function () {
    if (preference === 'system') applyTheme();
  });

  document.addEventListener('DOMContentLoaded', function () {
    var selector = document.getElementById('theme-select');
    if (!selector) return;
    selector.value = preference;
    selector.addEventListener('change', function (event) {
      savePreference(event.target.value);
    });
  });
})();
