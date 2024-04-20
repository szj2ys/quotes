import React, { useState, useEffect } from 'react';
import './App.css';
import quotes from './assets/quotes.json';

function App() {
  const [quote, setQuote] = useState({});
  const [quoteStack, setQuoteStack] = useState([...quotes]);

  useEffect(() => {
    initializeQuotes();
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
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

  return (
    <div className="App" onClick={fetchQuote} tabIndex="0">
      {!isQuoteEmpty(quote) && (
        <>
          <h1>{quote.quote}</h1>
          {quote.author && <p>- {quote.author}</p>}
        </>
      )}
      {isQuoteEmpty(quote) && <p>正在加载名言...</p>}
    </div>
  );
}

export default App;