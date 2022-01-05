//This file is to store functions that we use over and over again
import { TIMEOUT_SEC } from './config.js';
import { async } from 'regenerator-runtime';

/**
 * this function is to prevent too long loading (if internet is too bad)
 * @param {number} number of seconds
 * @returns {function} a promise with the timer
 * @author Jonas Shmedtmann
 */
const timeout = function (s) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error(`Request took too long! Timeout after ${s} second`));
    }, s * 1000);
  });
};

/**
 * this function is to prevent too long loading (if internet is too bad)
 * @param {string} URL used to make an AJAX call
 * @param {object} data to send (if required)
 * @returns {object} data recieved through the AJAX call
 * @author Jonas Shmedtmann
 */
export const AJAX = async function (url, uploadData = undefined) {
  try {
    const fetchPro = uploadData
      ? fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(uploadData),
        })
      : fetch(url);
    const res = await Promise.race([fetchPro, timeout(TIMEOUT_SEC)]);
    const data = await res.json();

    if (!res.ok) throw new Error(`${data.message} (${res.status})`);
    return data;
  } catch (err) {
    throw err;
  }
};

/**
 * checks if we can parse any data from the string
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
