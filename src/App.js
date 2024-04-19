import React, { useState, useEffect, useCallback } from 'react';
import ColorThief from 'colorthief';
import './App.css';
import quotes from './assets/quotes.json';

function App() {
  const [quote, setQuote] = useState({});
  const [backgroundColor, setBackgroundColor] = useState('');
  const [textColor, setTextColor] = useState('');
  const [quoteStack, setQuoteStack] = useState([...quotes]);

  useEffect(() => {
    // 组件加载时自动获取一次名言
    if (isQuoteEmpty(quote)) {
      fetchQuote();
    }

    // 添加键盘事件监听器
    const handleKeyDown = (event) => {
      if (event.code === 'Space') {
        fetchQuote();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // 移除键盘事件监听器
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    // 判断当前的quote是否为空,如果为空则自动获取
    if (isQuoteEmpty(quote) && quoteStack.length > 0) {
      fetchQuote();
    }
  }, [quote, quoteStack]);

  const isQuoteEmpty = (quote) => {
    return Object.keys(quote).length === 0;
  };

  const fetchQuote = useCallback(() => {
    if (quoteStack.length === 0) {
      setQuoteStack([...quotes]);
    }

    const randomIndex = Math.floor(Math.random() * quoteStack.length);
    const selectedQuote = quoteStack[randomIndex];
    setQuote(selectedQuote);

    const updatedQuoteStack = [...quoteStack];
    updatedQuoteStack.splice(randomIndex, 1);
    setQuoteStack(updatedQuoteStack);

    const bgImage = new Image();
    bgImage.src = selectedQuote.background_image;
    bgImage.crossOrigin = 'Anonymous';
    bgImage.onload = () => {
      const colorThief = new ColorThief();
      const bgColor = colorThief.getColor(bgImage);
      setBackgroundColor(`rgb(${bgColor.join(',')})`);

      const brightness = Math.round((bgColor[0] * 299 + bgColor[1] * 587 + bgColor[2] * 114) / 1000);
      const textColorValue = brightness > 125 ? 'black' : 'white';
      setTextColor(textColorValue);
    };
  }, [quoteStack]);

  return (
    <div
      className="App"
      onClick={fetchQuote}
      style={{
        backgroundColor: backgroundColor,
        color: textColor,
      }}
    >
      <h1>{quote.quote || '正在加载名言...'}</h1>
      {quote.author && <p>- {quote.author}</p>}
    </div>
  );
}

export default App;