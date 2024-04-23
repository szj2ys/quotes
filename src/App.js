import React, { useState, useEffect } from 'react';
import { useSwipeable } from 'react-swipeable';
import './App.css';
import quotes from './assets/quotes.json';

function App() {
  const [quote, setQuote] = useState({});
  const [quoteStack, setQuoteStack] = useState([...quotes]);
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  useEffect(() => {
    initializeQuotes();
    if (isMobile) {
      window.addEventListener('dblclick', handleDoubleClick);
    } else {
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('click', handleClick);
    }
    return () => {
      if (isMobile) {
        window.removeEventListener('dblclick', handleDoubleClick);
      } else {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('click', handleClick);
      }
    };
  }, []);

  useEffect(() => {
    if (isQuoteEmpty(quote) && quoteStack.length > 0) {
      fetchQuote();
    }
  }, [quote, quoteStack]);

  const isQuoteEmpty = (quote) => {
    if (typeof quote !== 'object' || quote === null) {
      return true;
    }
    return Object.keys(quote).length === 0;
  };

  const initializeQuotes = () => {
    const updatedQuoteStack = [...quotes];
    const randomIndex = Math.floor(Math.random() * updatedQuoteStack.length);
    const selectedQuote = updatedQuoteStack[randomIndex];
    setQuote(selectedQuote);
    updatedQuoteStack.splice(randomIndex, 1);
    setQuoteStack(updatedQuoteStack);
  };

  const fetchQuote = () => {
    const randomIndex = Math.floor(Math.random() * quoteStack.length);
    const selectedQuote = quoteStack[randomIndex];
    setQuote(selectedQuote);

    const updatedQuoteStack = [...quoteStack];
    updatedQuoteStack.splice(randomIndex, 1);
    setQuoteStack(updatedQuoteStack);

    if (updatedQuoteStack.length === 0) {
      initializeQuotes();
    }
  };

  const handleKeyDown = (event) => {
    if (event.code === 'Space') {
      fetchQuote();
    }
  };

  const handleDoubleClick = () => {
    fetchQuote();
  };

  const handleClick = () => {
    fetchQuote();
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => fetchQuote(),
    onSwipedRight: () => fetchQuote(),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });

  return (
    <div className="App" {...swipeHandlers} onDoubleClick={isMobile ? handleDoubleClick : null} onClick={!isMobile ? handleClick : null} tabIndex="0">
      {!isQuoteEmpty(quote) && (
        <>
          <h1>{quote.quote}</h1>
          {quote.author && <p>- {quote.author}</p>}
        </>
      )}
      {isQuoteEmpty(quote) && <p>请手动刷新一下...</p>}
    </div>
  );
}

export default App;