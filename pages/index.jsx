import React, { Component, Fragment } from 'react';
import Parser from 'rss-parser';
import IMAGE_EXTRACTION_STRATEGIES from '../lib/image';

const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';


const allSettled = promises => Promise.all(
  promises.map(promise => Promise.resolve(promise)
    .then(
      value => ({ status: 'success', value }),
      error => ({ status: 'error', error })
    )
  )
);

const shuffleArray = originalArray => {
  const array = originalArray.slice(0);
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

const SlideShow = ({ image, next, previous }) => (
  <div
    style={{
      width: '100%',
      height: '100%',
      background: `black url("${image}") no-repeat center center/contain fixed`,
    }}
    onClick={next}
  />
);


class Index extends Component {
  RSS_FEEDS = [
    'https://elcomercio.pe/feed',
    'https://peru21.pe/feed',
    'https://larepublica.pe/rss/feed',
    'http://utero.pe/feed/',
  ];

  extractImage = article =>
    IMAGE_EXTRACTION_STRATEGIES[
      article.enclosure
        ? 'getFromEnclosure'
        : 'extractFromPage'
    ](article);

  move = (direction) => () =>
    this.state.images[this.state.index + direction]
    && this.setState({ index: this.state.index + direction });
  next = this.move(1);
  previous = this.move(-1);

  state = { loading: true, images: [], index: 0 };

  componentDidMount() {
    allSettled(this.RSS_FEEDS.map(url => (new Parser()).parseURL(CORS_PROXY + url)))
      .then(results => results
        .filter(promiseResult => promiseResult.status === 'success')
        .map(validResults => validResults.value.items)
        .map(articles => articles.slice(0, 25))
        .flat()
      )
      .then(shuffleArray)
      .then(articles => articles.slice(0, 10))
      .then(articles => Promise.all(articles.map(this.extractImage)))
      .then(images =>
        this.setState(
          { loading: false, images },
          () => document.onkeyup = (e) => e.keyCode === 37 ? this.previous() : this.next()
        )
      )
  }

  render() {
    const {loading, images, index} = this.state;
    return (
      <>
        <style jsx global>{`
          body {
            color: white;
            background-color: black;
            width: 100%;
            height: 100%;

            margin: 0;
            font-family: monospace;
            font-size: 1.3rem;
          }

          #__next, #content {
            display: flex;
            width: 100%;
            height: 100%;
            flex-direction: column;
            position: absolute;
          }
        `}</style>
      {
        loading
        ? <h1>loading</h1>
        : <SlideShow image={images[index]} next={this.next} previous={this.previous} />
      }
      </>
    );
  }
}

export default Index;
