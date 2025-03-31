import * as fs from 'fs';
import * as path from 'path';
import * as shutil from 'fs-extra';
// Import epub-gen using require for compatibility
const Epub = require('epub-gen');

interface QuoteItem {
    quote: string;
    author: string;
}

class QuotesSaver {
    private input_file: string;
    private data: QuoteItem[];

    constructor(input_file_path: string) {
        /**
         * 初始化QuotesSaver对象。
         *
         * @param input_file_path 输入的JSON文件的路径。
         */
        this.input_file = input_file_path;
        this.data = this._load_data();
    }

    private _load_data(): QuoteItem[] {
        /**
         * 从文件路径加载JSON数据。
         *
         * @return 解析JSON后的数据。
         */
        const fileContent = fs.readFileSync(this.input_file, 'utf-8');
        return JSON.parse(fileContent);
    }

    public shuffle_quotes(): QuoteItem[] {
        /**
         * 随机打乱引用数据的顺序。
         */
        this.data.sort(() => Math.random() - 0.5);
        return this.data;
    }


    public async save_quotes_to_epub(output_dir: string, title: string = "温故知心", author: string = "尼古拉西格玛宋", shuffle: boolean = true): Promise<void> {
        /**
         * 将所有引用保存为EPUB电子书格式。
         *
         * @param output_dir 输出目录的路径。
         * @param title 电子书标题
         * @param author 电子书作者
         * @param shuffle 是否打乱引用顺序，默认为True。
         */
        const output_path = path.resolve(output_dir);
        fs.mkdirSync(output_path, {recursive: true});

        const epub_path = path.join(output_path, `${title}.epub`);

        // 如果需要打乱顺序
        if (shuffle) {
            this.shuffle_quotes();
            console.log("数据已随机打乱");
        }

        // 准备EPUB内容
        const content = [];
        const chapters = [];

        // 将引用分组，每组n条作为一章
        const quotesPerChapter = 100;
        let chapterCount = 0;
        let currentChapter = [];

        for (const item of this.data) {
            const quote = item.quote || '';
            const author = item.author || '';

            if (quote) {
                currentChapter.push({ quote, author });

                if (currentChapter.length >= quotesPerChapter) {
                    chapterCount++;
                    chapters.push({
                        title: `第${chapterCount}章`,
                        data: [...currentChapter]
                    });
                    currentChapter = [];
                }
            }
        }

        // 处理最后一章（如果有剩余引用）
        if (currentChapter.length > 0) {
            chapterCount++;
            chapters.push({
                title: `第${chapterCount}章`,
                data: [...currentChapter]
            });
        }

        // 为每一章生成HTML内容
        for (const chapter of chapters) {
            let chapterContent = "";
            // let chapterContent = `<h1>${chapter.title}</h1>\n`;

            for (const item of chapter.data) {
                chapterContent += `<div class="quote-item">
                    <p class="quote">${item.quote}</p>
                    <p class="author">---- ${item.author}</p>
                    <br><br><br>
                </div>\n`;
            }

            content.push({
                title: chapter.title,
                data: chapterContent
            });
        }

        // 准备封面图片路径
        const cover_src = path.join('src', 'assets', 'cover.jpg');
        let coverPath = null;

        try {
            if (fs.existsSync(cover_src)) {
                coverPath = cover_src;
            }
        } catch (error) {
            console.log(`警告: 获取封面图片时出错: ${error.message}`);
        }

        // 创建EPUB选项
        const options = {
            title: title,
            author: author,
            publisher: 'QuotesSaver',
            cover: coverPath,
            content: content,
            output: epub_path,  // 添加输出路径
            css: `
                .quote-item {
                    margin-bottom: 2em;
                    page-break-inside: avoid;
                }
                .quote {
                    font-size: 1.0em;
                }
                .author {
                    text-align: right;
                    font-style: italic;
                }
            `
        };

        try {
            // 生成EPUB文件
            await new Epub(options).promise;
            console.log(`EPUB电子书已保存至: ${epub_path}`);
        } catch (err) {
            console.error(`生成EPUB时出错: ${err.message}`);
        }
    }
}

// 主函数
async function main(): Promise<void> {
    const homedir = require('os').homedir();
    const source_dir = path.join(homedir, 'Downloads', 'quotes');
    fs.mkdirSync(source_dir, {recursive: true});

    const quotes_saver = new QuotesSaver('src/assets/quotes.json');

    // 保存为EPUB电子书
    try {
        await quotes_saver.save_quotes_to_epub(source_dir, "温故知心");
        console.log('well done!!!');
    } catch (error) {
        console.error('生成EPUB失败:', error);
    }
}

// 执行主函数
main().catch(error => {
    console.error('程序执行出错:', error);
});


