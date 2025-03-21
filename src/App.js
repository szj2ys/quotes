// 导入必要的模块和组件
import React, {useState, useEffect, useRef} from 'react';
import {useSwipeable} from 'react-swipeable';
import './App.css'; // 应用的样式文件
import quotes from './assets/quotes.json'; // 引入名言数据
import {CopyToClipboard} from 'react-copy-to-clipboard'; // 复制到剪贴板组件
import {FiCopy} from 'react-icons/fi'; // 复制图标组件


// 主应用组件
function App() {
    // 状态定义
    const [quote, setQuote] = useState({}); // 当前显示的名言
    const [quoteStack, setQuoteStack] = useState([...quotes]); // 剩余未展示的名言栈
    const [prevQuotes, setPrevQuotes] = useState([]); // 已展示过的名言列表
    const [copied, setCopied] = useState(false); // 是否已复制到剪贴板的状态
    const preRef = useRef(null);

    // 使用 useMemo 优化设备检测
    const isMobile = React.useMemo(() => 
        /iPhone|iPad|iPod|Android/i.test(navigator.userAgent), 
        []
    );

    // 合并空格计算逻辑为一个函数
    const calculateSpaces = React.useCallback((authorLength, ratio) => {
        const screenWidth = window.innerWidth;
        const charWidth = screenWidth / 26;
        const totalCharCapacity = Math.floor(screenWidth / charWidth);
        const spaces = Math.floor((totalCharCapacity / ratio - authorLength));
        return `\u2002`.repeat(Math.max(0, spaces));
    }, []);

    // 优化 margin 计算
    const calculateMargin = React.useCallback(() => {
        if (!preRef.current) return;
        const preElement = preRef.current;
        const containerWidth = preElement.parentElement.clientWidth;
        const preWidth = preElement.clientWidth;
        const divisor = isMobile ? 4 : 8;
        const marginLeftPercentage = ((containerWidth - preWidth) / divisor / containerWidth) * 100;
        preElement.style.marginLeft = `${Math.max(0, marginLeftPercentage)}%`;
    }, [isMobile]);

    // 优化事件处理函数
    const handleKeyDown = React.useCallback((event) => {
        if (event.target.closest('.copy-button')) return;
        
        const keyActions = {
            'ArrowUp': getPreviousQuote,
            'ArrowLeft': getPreviousQuote,
            'Space': fetchQuote,
            'ArrowDown': fetchQuote,
            'ArrowRight': fetchQuote
        };

        const action = keyActions[event.code];
        if (action) action();
    }, []);

    useEffect(() => {
        initializeQuotes();

        // 根据设备类型添加相应的事件监听
        if (isMobile) {
            window.addEventListener('dblclick', handleDoubleClick);
        } else {
            window.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            // 在组件卸载时移除事件监听
            if (isMobile) {
                window.removeEventListener('dblclick', handleDoubleClick);
            } else {
                window.removeEventListener('keydown', handleKeyDown);
            }
        };
    }, []);

    useEffect(() => {
        if (preRef.current) {
            preRef.current.scrollIntoView({behavior: 'instant'});
        }

        calculateMargin();
        window.addEventListener('resize', calculateMargin);

        return () => {
            window.removeEventListener('resize', calculateMargin);
        };
    }, [quote]);

    useEffect(() => {
        if (isQuoteEmpty(quote) && quoteStack.length > 0) {
            fetchQuote();
        }
    }, [quote, quoteStack]);

    useEffect(() => {
        if (prevQuotes.length > 0) {
            setQuote(prevQuotes[prevQuotes.length - 1]);
        }
    }, [prevQuotes]);


    // 检查对象是否为空
    const isQuoteEmpty = (quote) => Object.keys(quote).length === 0;

    // 初始化名言展示逻辑
    const initializeQuotes = () => {
        const shuffledQuotes = [...quotes]; // 复制引用，避免直接修改原数组
        const randomIndex = Math.floor(Math.random() * shuffledQuotes.length);
        const selectedQuote = shuffledQuotes[randomIndex];

        // 设置初始名言、更新栈和历史记录
        setQuote(selectedQuote);
        setPrevQuotes(prevQuotes => [...prevQuotes, selectedQuote]);

        shuffledQuotes.splice(randomIndex, 1);
        setQuoteStack(shuffledQuotes);
    };

    // 获取并展示新的名言
    const fetchQuote = () => {
        const randomIndex = Math.floor(Math.random() * quoteStack.length);
        const selectedQuote = quoteStack[randomIndex];

        setQuote(selectedQuote);
        setPrevQuotes(prevQuotes => [...prevQuotes, selectedQuote]);

        const updatedQuoteStack = [...quoteStack];
        updatedQuoteStack.splice(randomIndex, 1);
        setQuoteStack(updatedQuoteStack);

        // 如果栈空了，重新初始化
        if (updatedQuoteStack.length === 0) {
            initializeQuotes();
        }
    };

    // 获取上一条名言
    const getPreviousQuote = () => {

        const updatedPrevQuotes = [...prevQuotes];

        if (updatedPrevQuotes.length > 0) {
            const prevQuote = prevQuotes[prevQuotes.length - 1];
            setQuote(prevQuote);
            updatedPrevQuotes.splice(prevQuotes.length - 1, 1);
            setPrevQuotes(updatedPrevQuotes);
        }
    };


    // 双击事件处理，切换名言
    const handleDoubleClick = (event) => {
        fetchQuote();
    };


    // 点击事件处理，除了复制按钮外的点击切换名言
    const handleClick = (event) => {
        const isCopyButton = event.target.closest('.copy-button');
        if (!isCopyButton) {
            fetchQuote();
        }
    };

    // 使用 useSwipeable 钩子处理滑动事件
    const swipeHandlers = useSwipeable({
        onSwipedLeft: () => fetchQuote(), // 向左滑动切换名言
        onSwipedRight: () => getPreviousQuote(), // 向右滑动切换名言
        preventDefaultTouchmoveEvent: true, // 阻止默认的触摸移动事件
        trackMouse: false, // 跟踪鼠标事件
        delta: 18, // 触发滑动的最小移动距离
        preventScrollOnSwipe: false, // 不阻止滑动时的页面滚动
    });


    return (
        <div
            className="content-wrapper"
            onDoubleClick={isMobile ? handleDoubleClick : undefined}
            onKeyDown={!isMobile ? handleKeyDown : undefined}
            tabIndex="0" // 允许div接收键盘焦点
        >
            <>
                <pre ref={preRef} key={quote.quote}>{quote.quote}</pre>
                <p key={quote.author} {...swipeHandlers}>
                    {quote.author && calculateSpaces(quote.author.length, 1.8)}
                    ~{quote.author}
                    {quote.author && calculateSpaces(quote.author.length, 2.6)}
                </p>

                <CopyToClipboard
                    text={`${quote.quote}${quote.author ? ` ~${quote.author}` : ''}`}
                    onCopy={() => {
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                    }}
                >
                    <button className="copy-button" aria-label="Copy Quote">
                        <FiCopy size={35} />
                    </button>
                </CopyToClipboard>
                {copied && <span className="copied-message">已复制!</span>}
            </>
        </div>
    );
}

export default App;


