const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';

const extractFromPage = ({ link }) => fetch(CORS_PROXY + link)
  .then(response => response.text())
  .then(content => content.match(/og:image" content="([^\"]+)"/)[1] || 'https://picsum.photos/1920/1080');

const getFromEnclosure = ({ enclosure: { url } }) => Promise.resolve(url);

export default {
  extractFromPage,
  getFromEnclosure,
};
