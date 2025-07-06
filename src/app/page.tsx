"use client";

import React, {useState, useEffect, useRef, useCallback, useMemo, JSX} from 'react';
import { useSwipeable } from 'react-swipeable';
import { FiCopy } from 'react-icons/fi';
import GlassBox from "@/components/glass-box";
import LiquidDrop from "@/components/liquid-drop-box";

// 定义名言的类型接口
interface Quote {
  quote?: string;
  author?: string;
}

export default function Home(): JSX.Element {
  // 状态定义
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [quote, setQuote] = useState<Quote>({});
  const [quoteStack, setQuoteStack] = useState<Quote[]>([]);
  const [prevQuotes, setPrevQuotes] = useState<Quote[]>([]);
  const [copied, setCopied] = useState<boolean>(false);
  const preRef = useRef<HTMLPreElement>(null);

  // 加载 quotes 数据
  useEffect(() => {
    const loadQuotes = async () => {
      try {
        const response = await fetch('/quotes.json');
        const quotesData: Quote[] = await response.json();
        setQuotes(quotesData);
        setQuoteStack([...quotesData]);
      } catch (error) {
        console.error('Failed to load quotes:', error);
      }
    };

    loadQuotes();
  }, []);

  // 使用 useMemo 优化设备检测
  const isMobile = useMemo<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  }, []);

  // 复制功能的实现
  const copyToClipboard = useCallback(async (text: string): Promise<void> => {
    try {
      // 优先使用现代的 Clipboard API
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // 回退到传统的 execCommand 方法
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy text: ', error);
    }
  }, []);

  // 处理复制按钮点击
  const handleCopyClick = useCallback(() => {
    const textToCopy = `${quote.quote}${quote.author ? ` ~${quote.author}` : ''}`;
    copyToClipboard(textToCopy);
  }, [quote, copyToClipboard]);

  // 其余函数保持不变，但需要确保 quotes 已加载
  const initializeQuotes = useCallback((): void => {
    if (quotes.length === 0) return; // 确保 quotes 已加载

    const shuffledQuotes: Quote[] = [...quotes];
    const randomIndex = Math.floor(Math.random() * shuffledQuotes.length);
    const selectedQuote = shuffledQuotes[randomIndex];

    setQuote(selectedQuote);
    setPrevQuotes(prevQuotes => [...prevQuotes, selectedQuote]);

    shuffledQuotes.splice(randomIndex, 1);
    setQuoteStack(shuffledQuotes);
  }, [quotes]);

  // 修改初始化效果，依赖 quotes
  useEffect(() => {
    if (quotes.length > 0) {
      initializeQuotes();
    }
  }, [quotes, initializeQuotes]);

  // 其余代码保持不变...
  const calculateSpaces = useCallback((authorLength: number, ratio: number): string => {
    if (typeof window === 'undefined') return '';

    const screenWidth = window.innerWidth;
    const charWidth = screenWidth / 26;
    const totalCharCapacity = Math.floor(screenWidth / charWidth);
    const spaces = Math.floor((totalCharCapacity / ratio - authorLength));
    return `\u2002`.repeat(Math.max(0, spaces));
  }, []);

  const isQuoteEmpty = useCallback((quote: Quote): boolean =>
      Object.keys(quote).length === 0, []
  );

  const fetchQuote = useCallback((): void => {
    if (quoteStack.length === 0) {
      initializeQuotes();
      return;
    }

    const randomIndex = Math.floor(Math.random() * quoteStack.length);
    const selectedQuote = quoteStack[randomIndex];

    setQuote(selectedQuote);
    setPrevQuotes(prevQuotes => [...prevQuotes, selectedQuote]);

    const updatedQuoteStack = [...quoteStack];
    updatedQuoteStack.splice(randomIndex, 1);
    setQuoteStack(updatedQuoteStack);

    if (updatedQuoteStack.length === 0) {
      initializeQuotes();
    }
  }, [quoteStack, initializeQuotes]);

  const getPreviousQuote = useCallback((): void => {
    const updatedPrevQuotes = [...prevQuotes];

    if (updatedPrevQuotes.length > 0) {
      const prevQuote = prevQuotes[prevQuotes.length - 1];
      setQuote(prevQuote);
      updatedPrevQuotes.splice(prevQuotes.length - 1, 1);
      setPrevQuotes(updatedPrevQuotes);
    }
  }, [prevQuotes]);

  const calculateMargin = useCallback((): void => {
    if (!preRef.current) return;

    const preElement = preRef.current;
    const containerWidth = preElement.parentElement?.clientWidth || 0;
    const preWidth = preElement.clientWidth;
    const divisor = isMobile ? 4 : 8;
    const marginLeftPercentage = ((containerWidth - preWidth) / divisor / containerWidth) * 100;
    preElement.style.marginLeft = `${Math.max(0, marginLeftPercentage)}%`;
  }, [isMobile]);

  const handleDoubleClick = useCallback((event: React.MouseEvent<HTMLDivElement>): void => {
    fetchQuote();
  }, [fetchQuote]);

  const handleKeyDownReact = useCallback((event: React.KeyboardEvent<HTMLDivElement>): void => {
    if ((event.target as Element)?.closest('.copy-button')) return;

    const keyActions: { [key: string]: () => void } = {
      'ArrowUp': getPreviousQuote,
      'ArrowLeft': getPreviousQuote,
      'Space': fetchQuote,
      'ArrowDown': fetchQuote,
      'ArrowRight': fetchQuote
    };

    const action = keyActions[event.code];
    if (action) action();
  }, [fetchQuote, getPreviousQuote]);

  useEffect(() => {
    if (preRef.current) {
      preRef.current.scrollIntoView({ behavior: 'instant' });
    }

    calculateMargin();

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', calculateMargin);
      return () => {
        window.removeEventListener('resize', calculateMargin);
      };
    }
  }, [quote, calculateMargin]);

  useEffect(() => {
    if (isQuoteEmpty(quote) && quoteStack.length > 0) {
      fetchQuote();
    }
  }, [quote, quoteStack, fetchQuote, isQuoteEmpty]);

  useEffect(() => {
    if (prevQuotes.length > 0) {
      setQuote(prevQuotes[prevQuotes.length - 1]);
    }
  }, [prevQuotes]);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => fetchQuote(),
    onSwipedRight: () => getPreviousQuote(),
    trackMouse: false,
    delta: 18,
    preventScrollOnSwipe: false,
  });

  // 如果 quotes 还没加载完成，显示加载状态
  if (quotes.length === 0) {
    return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-xl md:text-2xl text-gray-600">Loading quotes...</div>
        </div>
    );
  }

  return (
      <div
          className="min-h-screen flex flex-col items-center justify-center px-4 md:px-8 lg:px-16"
          onDoubleClick={isMobile ? handleDoubleClick : undefined}
          onKeyDown={!isMobile ? handleKeyDownReact : undefined}
          tabIndex={0}
      >
        <GlassBox className="max-w-4xl mx-auto">
          <div className="max-w-4xl mx-auto text-center space-y-6">
        <pre
            ref={preRef}
            key={quote.quote}
            className="text-lg text-justify md:text-xl lg:text-2xl leading-relaxed whitespace-pre-wrap font-mono text-white"
        >
          {quote.quote}
        </pre>

            <p
                key={quote.author}
                {...swipeHandlers}
                className="text-base text-right md:text-lg lg:text-xl text-shadow-white italic"
            >
              {quote.author && calculateSpaces(quote.author.length, 1.8)}
              ~{quote.author}
              {quote.author && calculateSpaces(quote.author.length, 2.6)}
            </p>

            <div className="flex left-1/4 mt-8">
              <button
                  onClick={handleCopyClick}
                  className="copy-button focus:outline-none"
                  aria-label="复制名言"
              >
                <FiCopy size={34} className="text-gray-400 hover:text-gray-200 transition-colors cursor-pointer" />
              </button>
            </div>

            {copied && (
                <div className="fixed top-4 right-4 bg-green-800 text-white px-4 py-2 rounded-lg shadow-lg">
                  <span className="text-sm font-medium">已复制!</span>
                </div>
            )}
          </div>
        </GlassBox>
      </div>
  );
}
