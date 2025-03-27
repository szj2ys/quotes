import * as fs from 'fs';
import * as path from 'path';
import * as shutil from 'fs-extra';

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

    public save_quotes(output_dir: string): void {
        /**
         * 遍历this.data并将每个引用保存到单独的Markdown文件中。
         *
         * @param output_dir 输出目录的路径。
         */
        const output_path = path.resolve(output_dir);
        fs.mkdirSync(output_path, {recursive: true});

        for (const item of this.data) {
            const quote = item.quote || '';
            const author = item.author || '';
            if (quote) {
                const filename = 'quotes_' + quote.slice(0, 12)
                    .replace('。', '')
                    .replace('；', '')
                    .replace('：', '')
                    .replace('[', '')
                    .replace(']', '')
                    .replace('.', '')
                    .replace('《', '')
                    .replace('》', '')
                    .replace('"', '')
                    .replace('"', '')
                    .replace('，', '')
                    .split(' ')
                    .join('_') + '.md';

                const file_path = path.join(output_path, filename);
                const content = author.includes('佚名') ?
                    `${quote}` :
                    `${quote}\n\n--${author}`;

                fs.writeFileSync(file_path, content, 'utf-8');
                console.log(`Quote saved to: ${file_path}`);
            }
        }
    }

    public save_quotes_to_single_file(output_dir: string, shuffle: boolean = true): void {
        /**
         * 将所有引用保存到单个quotes.md文件中。
         *
         * @param output_dir 输出目录的路径。
         * @param shuffle 是否打乱引用顺序，默认为True。
         */
        const output_path = path.resolve(output_dir);
        fs.mkdirSync(output_path, {recursive: true});

        const file_path = path.join(output_path, 'quotes.md');

        // 如果需要打乱顺序
        if (shuffle) {
            this.shuffle_quotes();
            console.log("数据已随机打乱");
        }

        let content = '';
        for (const item of this.data) {
            const quote = item.quote || '';
            const author = item.author || '';
            if (quote) {
                if (author.includes('佚名')) {
                    // content += `${quote}\n\n\n`;
                    content += `${quote}\n--${author}\n\n\n`;
                } else {
                    content += `${quote}\n--${author}\n\n\n`;
                }
            }
        }

        fs.writeFileSync(file_path, content, 'utf-8');
        console.log(`All quotes saved to: ${file_path}`);

        // 复制cover.jpg到quotes.md所在目录
        const cover_src = path.join('src', 'assets', 'cover.jpg');
        const cover_dst = path.join(output_path, 'cover.jpg');

        try {
            shutil.copySync(cover_src, cover_dst);
            console.log(`Cover image copied to: ${cover_dst}`);
        } catch (error) {
            if (error.code === 'ENOENT') {
                console.log(`警告: 封面图片文件 ${cover_src} 未找到`);
            } else {
                console.log(`复制封面图片时出错: ${error.message}`);
            }
        }
    }
}

// 主函数
function main(): void {
    const homedir = require('os').homedir();
    const source_dir = path.join(homedir, 'Downloads', 'quotes');
    fs.mkdirSync(source_dir, {recursive: true});

    const quotes_saver = new QuotesSaver('src/assets/quotes.json');
    quotes_saver.save_quotes_to_single_file(source_dir, true);
    console.log('well done!!!');
}

// 执行主函数
main();

