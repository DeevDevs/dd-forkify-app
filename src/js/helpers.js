//This file is to store functions that we use over and over again (тут хранятся функции для многоразового применения)
import { TIMEOUT_SEC } from './config.js';
import { async } from 'regenerator-runtime';

/**
 * prevent too long loading (if internet is too bad) (предотвращает продолжительный запрос)
 * @param {number} number of seconds
 * @returns {function} a promise with the timer
 * @author Jonas Shmedtmann (written by Dmitriy Vnuchkov)
 */
const timeout = function (s) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error(`Request took too long! Timeout after ${s} second`));
    }, s * 1000);
  });
};

/**
 * makes an AJAX request to the APIs and, if the response is too late, creates an error (совершает запросы в API или создает ошибку)
 * @param {string} URL used to make an AJAX call
 * @param {object} data to send (if required)
 * @returns {object} data recieved through the AJAX call
 * @author Jonas Shmedtmann (written by Dmitriy Vnuchkov)
 */
export const AJAX = async function (url, uploadData = undefined) {
  try {
    //makes a POST request (совершает POST запрос)
    const fetchPro = uploadData
      ? fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(uploadData),
        })
      : fetch(url);
    //checks if the response arrives soon (проверяет, успел ли прийти ответ)
    const res = await Promise.race([fetchPro, timeout(TIMEOUT_SEC)]);
    const data = await res.json();

    if (!res.ok) throw new Error(`${data.message} (${res.status})`);
    return data;
  } catch (err) {
    throw err;
  }
};

/**
 * checks if we can parse any data from the string (проверяет, можно ли вывести данные из строки)
 * @param {string} string to check, if parsable
 * @returns {object} data
 * @author Dmitriy Vnuchkov
 */
export const isJSONparsable = function (data) {
  try {
    JSON.parse(data);
    return true;
  } catch (e) {
    return false;
  }
};
