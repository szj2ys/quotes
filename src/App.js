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
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent); // 判断是否为移动设备
    const preRef = useRef(null);

    // 初始化名言和设置事件监听器
    useEffect(() => {
        initializeQuotes(); // 初始化名言展示

        // 根据设备类型添加相应的事件监听
        if (isMobile) {
            window.addEventListener('dblclick', handleDoubleClick);
        } else {
            window.addEventListener('keydown', handleKeyDown);
            // window.addEventListener('dblclick', handleDoubleClick); # 会导致双击事件的函数出发两次，don't know why?
        }

        // 组件卸载时移除事件监听
        return () => {
            if (isMobile) {
                window.removeEventListener('dblclick', handleDoubleClick);
            } else {
                window.removeEventListener('keydown', handleKeyDown);
                // window.removeEventListener('dblclick', handleDoubleClick);
            }
        };
    }, []); // 空依赖数组，只在组件挂载和卸载时运行

    // 在组件挂载后执行效果
    useEffect(() => {
        // 如果 preRef.current 存在(组件已渲染)
        if (preRef.current) {
            // 将 pre 元素滚动到顶部
            preRef.current.scrollIntoView({behavior: 'instant'});
        }

        const calculateMargin = () => {
            const preElement = preRef.current;
            const containerWidth = preElement.parentElement.clientWidth;
            const preWidth = preElement.clientWidth;
            let marginLeftPercentage;
            if (isMobile) {
                marginLeftPercentage = ((containerWidth - preWidth) / 4 / containerWidth) * 100;
            } else {
                marginLeftPercentage = ((containerWidth - preWidth) / 88 / containerWidth) * 100;
            }
            preElement.style.marginLeft = `${marginLeftPercentage}%`;
        };

        calculateMargin();
        window.addEventListener('resize', calculateMargin);

        return () => {
            window.removeEventListener('resize', calculateMargin);
        };
    }, [quote]);

    // 当quote或quoteStack变化时，若当前没有名言且栈中有名言，则获取新名言
    useEffect(() => {
        if (isQuoteEmpty(quote) && quoteStack.length > 0) {
            fetchQuote();
        }
    }, [quote, quoteStack, prevQuotes]);

    useEffect(() => {
        // ...

        // 如果 prevQuotes 发生变化且长度大于0，更新 quote 状态
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


    // 键盘事件处理，用于切换名言
    const handleKeyDown = (event) => {
        const isCopyButton = event.target.closest('.copy-button');
        if (!isCopyButton) {
            const allowedKeys = ['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
            const goPrevioiusQuoteKeys = ['ArrowUp', 'ArrowLeft'];
            if (allowedKeys.includes(event.code)) {
                if (goPrevioiusQuoteKeys.includes(event.code)) {
                    getPreviousQuote();
                } else {
                    fetchQuote();
                }
            }
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
        delta: 88, // 触发滑动的最小移动距离
        preventScrollOnSwipe: false, // 不阻止滑动时的页面滚动
    });

    // 渲染UI
    return (
        <div
            className="content-wrapper"
            {...swipeHandlers} // 传递滑动事件处理器
            onDoubleClick={handleDoubleClick} // 双击事件
            tabIndex="0" // 允许div接收键盘焦点
        >
            {/* 名言展示内容 */}
            <>
                <pre ref={preRef} key={quote.quote}>{quote.quote}</pre>
                {/* 名言内容 */}
                <p key={quote.author}>- {quote.author}</p> {/* 作者 */}
                {/* 复制到剪贴板按钮 */}
                <CopyToClipboard
                    text={`${quote.quote} ${quote.author ? `- ${quote.author}` : ''}`} // 复制的内容
                    onCopy={() => {
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000); // 复制成功提示
                    }}
                >
                    <button className="copy-button" aria-label="Copy Quote">
                        <FiCopy size={35}/> {/* 复制图标 */}
                    </button>
                </CopyToClipboard>
                {copied && <span
                    className="copied-message">Copied!</span>} {/* 复制成功提示 */}
            </>
        </div>
    );
}

// 导出App组件
export default App;




