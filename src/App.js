import React, {useState, useEffect} from 'react';
import {useSwipeable} from 'react-swipeable';
import './App.css';
import quotes from './assets/quotes.json';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import {FiCopy} from 'react-icons/fi';

function App() {
    const [quote, setQuote] = useState({});
    const [quoteStack, setQuoteStack] = useState([...quotes]);
    const [copied, setCopied] = useState(false);
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    useEffect(() => {
        initializeQuotes();
        if (isMobile) {
            window.addEventListener('dblclick', handleDoubleClick);
        } else {
            window.addEventListener('keydown', handleKeyDown);
            window.addEventListener('dblclick', handleDoubleClick);
        }
        return () => {
            if (isMobile) {
                window.removeEventListener('dblclick', handleDoubleClick);
            } else {
                window.removeEventListener('keydown', handleKeyDown);
                window.removeEventListener('dblclick', handleDoubleClick);
            }
        };
    }, []);

    useEffect(() => {
        if (isQuoteEmpty(quote) && quoteStack.length > 0) {
            fetchQuote();
        }
    }, [quote, quoteStack]);

    const isQuoteEmpty = (quote) => Object.keys(quote).length === 0;

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

    const handleQuoteChange = () => {
        fetchQuote();
    };

    const handleKeyDown = (event) => {
        const isCopyButton = event.target.closest('.copy-button');
        if (!isCopyButton) {
            const allowedKeys = ['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
            if (allowedKeys.includes(event.code)) {
                handleQuoteChange();
            }
        }
    };

    const handleDoubleClick = () => {
        handleQuoteChange();
    };

    const handleClick = (event) => {
        const isCopyButton = event.target.closest('.copy-button');
        if (!isCopyButton) {
            handleQuoteChange();
        }
    };

    const swipeHandlers = useSwipeable({
        onSwipedLeft: () => fetchQuote(),
        onSwipedRight: () => fetchQuote(),
        preventDefaultTouchmoveEvent: true,
        trackMouse: true, // 鼠标事件跟踪
        delta: 66, // 增加触发滑动事件所需的最小移动距离
        preventScrollOnSwipe: false, // 防止滑动事件触发页面滚动
    });

    return (
        <div
            className="content-wrapper"
            {...swipeHandlers}
            onDoubleClick={handleDoubleClick}
            tabIndex="0"
        >
            {!isQuoteEmpty(quote) && (
                <>
                    <pre>{quote.quote}</pre>
                    {quote.author && <p>- {quote.author}</p>}
                    <CopyToClipboard
                        text={`${quote.quote} ${quote.author ? `- ${quote.author}` : ''}`}
                        onCopy={() => {
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                        }}
                    >
                        <button className="copy-button" aria-label="Copy Quote">
                            <FiCopy size={35}/>
                        </button>
                    </CopyToClipboard>
                    {copied && <span className="copied-message">Copied!</span>}
                </>
            )}
            {isQuoteEmpty(quote) && <p>请手动刷新一下...</p>}
        </div>
    );
}

export default App;




