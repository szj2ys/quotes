import json
import os
from datetime import datetime
from ebooklib import epub


class Quote:
    """引用类，表示单个引用"""

    def __init__(self, content, author=None, source=None, tags=None):
        self.content = content
        self.author = author
        self.source = source
        self.tags = tags or []

    @classmethod
    def from_dict(cls, quote_dict):
        """从字典创建引用对象"""
        return cls(
            content=quote_dict.get('content', ''),
            author=quote_dict.get('author', None),
            source=quote_dict.get('source', None),
            tags=quote_dict.get('tags', [])
        )

    def __str__(self):
        parts = [f'"{self.content}"']
        if self.author:
            parts.append(f"—— {self.author}")
        if self.source:
            parts.append(f"《{self.source}》")
        return "\n".join(parts)


class QuoteCollection:
    """引用集合类，管理多个引用"""

    def __init__(self, title="引用集锦"):
        self.title = title
        self.quotes = []
        self.tags = set()

    def add_quote(self, quote):
        """添加一个引用到集合"""
        self.quotes.append(quote)
        if quote.tags:
            self.tags.update(quote.tags)

    def load_from_json(self, json_file):
        """从JSON文件加载引用"""
        try:
            with open(json_file, 'r', encoding='utf-8') as f:
                content = f.read()

            print(f"原始JSON内容前100个字符: {content[:100]}")

            # 处理特殊格式: {{"quote": "", "author": ""}, {"quote": "", "author": ""}}
            if content.strip().startswith('{{'):
                print("检测到特殊JSON格式，尝试修复...")
                # 移除外层的大括号
                content = content.strip()
                if content.startswith('{{'):
                    content = content[1:]
                if content.endswith('}}'):
                    content = content[:-1]

            # 处理非标准JSON格式：将多个JSON对象合并为一个数组
            if content.strip().startswith('{') and (
                    '},\n{' in content or '},{' in content):
                print("检测到多个JSON对象，合并为数组...")
                if not content.startswith('['):
                    content = '[' + content
                if not content.endswith(']'):
                    content = content + ']'
                # 修复可能的JSON格式问题
                content = content.replace('},\n{', '},{')
                content = content.replace('}\n{', '},{')

            try:
                print(f"尝试解析JSON...")
                data = json.loads(content)
            except json.JSONDecodeError as e:
                print(f"JSON解析错误: {e}")
                print("尝试更强力的修复...")

                # 尝试更强力的修复
                content = content.replace('}\n{', '},{')
                content = content.replace('},\n{', '},{')
                content = content.replace('}}{{', '}},{')
                content = content.replace('}}{', '}},{')

                # 确保是一个有效的JSON数组
                if not content.startswith('['):
                    content = '[' + content
                if not content.endswith(']'):
                    content = content + ']'

                print(f"修复后的JSON前100个字符: {content[:100]}")
                data = json.loads(content)

            print(f"JSON解析成功，数据类型: {type(data)}")

            if isinstance(data, list):
                print(f"处理列表数据，包含 {len(data)} 个项目")
                for quote_data in data:
                    # 适配你的JSON格式，使用'quote'而不是'content'
                    if 'quote' in quote_data and 'content' not in quote_data:
                        quote_data['content'] = quote_data.pop('quote')
                    self.add_quote(Quote.from_dict(quote_data))
            elif isinstance(data, dict):
                print("处理字典数据")
                if 'quotes' in data and isinstance(data['quotes'], list):
                    print(f"处理'quotes'字段，包含 {len(data['quotes'])} 个项目")
                    for quote_data in data['quotes']:
                        # 适配你的JSON格式
                        if 'quote' in quote_data and 'content' not in quote_data:
                            quote_data['content'] = quote_data.pop('quote')
                        self.add_quote(Quote.from_dict(quote_data))
                    if 'title' in data:
                        self.title = data['title']
                else:
                    # 适配你的JSON格式
                    if 'quote' in data and 'content' not in data:
                        data['content'] = data.pop('quote')
                    self.add_quote(Quote.from_dict(data))

            print(f"成功加载 {len(self.quotes)} 条引用")

            # 检查是否有空内容的引用
            empty_quotes = [i for i, q in enumerate(self.quotes) if
                            not q.content]
            if empty_quotes:
                print(
                    f"警告: 发现 {len(empty_quotes)} 条空内容的引用，索引: {empty_quotes}")

        except Exception as e:
            print(f"加载JSON文件时出错: {e}")
            import traceback
            traceback.print_exc()

    def get_quotes_by_tag(self, tag):
        """获取特定标签的所有引用"""
        return [quote for quote in self.quotes if tag in quote.tags]

    def get_quotes_by_author(self, author):
        """获取特定作者的所有引用"""
        return [quote for quote in self.quotes if quote.author == author]


class EpubGenerator:
    """EPUB电子书生成器"""

    def __init__(self, collection):
        self.collection = collection
        self.book = epub.EpubBook()
        self.chapters = []

    def setup_book_metadata(self):
        """设置电子书元数据"""
        self.book.set_identifier(
            f'quotes-{datetime.now().strftime("%Y%m%d%H%M%S")}')
        self.book.set_title(self.collection.title)
        self.book.set_language('zh-CN')
        self.book.add_author('引用集锦生成器')

        # 添加CSS样式
        style = '''
        body {
            font-family: "Noto Serif CJK SC", "Source Han Serif CN", serif;
            margin: 5%;
            text-align: justify;
        }
        h1, h2 {
            text-align: center;
            color: #333;
        }
        .quote {
            margin: 1em 0;
            padding: 1em;
            border-left: 4px solid #ddd;
            background-color: #f9f9f9;
        }
        .author {
            text-align: right;
            font-style: italic;
            margin-top: 0.5em;
        }
        .source {
            text-align: right;
            font-size: 0.9em;
            color: #666;
        }
        .tags {
            margin-top: 0.5em;
            font-size: 0.8em;
            color: #888;
        }
        '''
        css = epub.EpubItem(
            uid="style",
            file_name="style/style.css",
            media_type="text/css",
            content=style
        )
        self.book.add_item(css)

    def create_intro_chapter(self):
        """创建介绍章节"""
        intro = epub.EpubHtml(title='介绍', file_name='intro.xhtml',
                              lang='zh-CN')
        intro.content = f'''
        <html>
        <head>
            <title>介绍</title>
            <link rel="stylesheet" href="style/style.css" type="text/css" />
        </head>
        <body>
            <h1>{self.collection.title}</h1>
            <p>本电子书包含 {len(self.collection.quotes)} 条精选引用。</p>
            <p>生成时间: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}</p>
        </body>
        </html>
        '''
        self.book.add_item(intro)
        self.chapters.append(intro)
        return intro

    def create_all_quotes_chapter(self):
        """创建包含所有引用的章节"""
        all_quotes = epub.EpubHtml(title='所有引用',
                                   file_name='all_quotes.xhtml', lang='zh-CN')

        content = ['<h1>所有引用</h1>']
        for i, quote in enumerate(self.collection.quotes, 1):
            content.append(self._format_quote_html(quote, i))

        all_quotes.content = f'''
        <html>
        <head>
            <title>所有引用</title>
            <link rel="stylesheet" href="style/style.css" type="text/css" />
        </head>
        <body>
            {''.join(content)}
        </body>
        </html>
        '''
        self.book.add_item(all_quotes)
        self.chapters.append(all_quotes)

    def create_tag_chapters(self):
        """为每个标签创建章节"""
        if not self.collection.tags:
            return

        for tag in sorted(self.collection.tags):
            tag_quotes = self.collection.get_quotes_by_tag(tag)
            if not tag_quotes:
                continue

            tag_chapter = epub.EpubHtml(
                title=f'标签: {tag}',
                file_name=f'tag_{tag.replace(" ", "_")}.xhtml',
                lang='zh-CN'
            )

            content = [f'<h1>标签: {tag}</h1>']
            for i, quote in enumerate(tag_quotes, 1):
                content.append(self._format_quote_html(quote, i))

            tag_chapter.content = f'''
            <html>
            <head>
                <title>标签: {tag}</title>
                <link rel="stylesheet" href="style/style.css" type="text/css" />
            </head>
            <body>
                {''.join(content)}
            </body>
            </html>
            '''
            self.book.add_item(tag_chapter)
            self.chapters.append(tag_chapter)

    def create_author_chapters(self):
        """为每个作者创建章节"""
        authors = {quote.author for quote in self.collection.quotes if
                   quote.author}

        for author in sorted(authors):
            author_quotes = self.collection.get_quotes_by_author(author)
            if not author_quotes:
                continue

            author_chapter = epub.EpubHtml(
                title=f'作者: {author}',
                file_name=f'author_{author.replace(" ", "_")}.xhtml',
                lang='zh-CN'
            )

            content = [f'<h1>作者: {author}</h1>']
            for i, quote in enumerate(author_quotes, 1):
                content.append(self._format_quote_html(quote, i))

            author_chapter.content = f'''
            <html>
            <head>
                <title>作者: {author}</title>
                <link rel="stylesheet" href="style/style.css" type="text/css" />
            </head>
            <body>
                {''.join(content)}
            </body>
            </html>
            '''
            self.book.add_item(author_chapter)
            self.chapters.append(author_chapter)

    def _format_quote_html(self, quote, index):
        """格式化单个引用的HTML"""
        html = f'<div class="quote" id="quote-{index}">\n'
        html += f'  <p>{quote.content}</p>\n'

        if quote.author:
            html += f'  <p class="author">—— {quote.author}</p>\n'

        if quote.source:
            html += f'  <p class="source">《{quote.source}》</p>\n'

        if quote.tags:
            tags_str = ', '.join(quote.tags)
            html += f'  <p class="tags">标签: {tags_str}</p>\n'

        html += '</div>\n'
        return html

    def create_toc(self):
        """创建目录"""
        self.book.toc = self.chapters

        # 添加spine
        self.book.spine = ['nav'] + self.chapters

        # 添加NCX和导航文件
        self.book.add_item(epub.EpubNcx())
        self.book.add_item(epub.EpubNav())

    def generate_epub(self, output_path=None):
        """生成EPUB文件"""
        try:
            if not output_path:
                output_path = f"{self.collection.title.replace(' ', '_')}.epub"

            # 确保输出目录存在
            output_dir = os.path.dirname(output_path)
            if output_dir and not os.path.exists(output_dir):
                os.makedirs(output_dir)

            # 检查是否有引用
            if not self.collection.quotes:
                print("错误: 没有引用数据，无法生成电子书")
                return None

            print(f"开始生成EPUB，包含 {len(self.collection.quotes)} 条引用")

            self.setup_book_metadata()
            intro = self.create_intro_chapter()
            self.create_all_quotes_chapter()

            # 只有在有标签时才创建标签章节
            if self.collection.tags:
                self.create_tag_chapters()

            # 创建作者章节
            self.create_author_chapters()

            # 检查是否有章节
            if not self.chapters:
                print("错误: 没有章节内容，无法生成电子书")
                return None

            print(f"创建了 {len(self.chapters)} 个章节")

            self.create_toc()

            # 写入EPUB文件
            print("开始写入EPUB文件...")
            epub.write_epub(output_path, self.book, {})
            print(f"EPUB电子书已生成: {output_path}")
            return output_path
        except Exception as e:
            print(f"生成EPUB时出错: {e}")
            import traceback
            traceback.print_exc()
            return None


def main():
    """主函数"""
    import argparse

    parser = argparse.ArgumentParser(
        description='将JSON格式的引用转换为EPUB电子书')
    parser.add_argument('json_file', help='JSON文件路径')
    parser.add_argument('-o', '--output', help='输出EPUB文件路径')
    parser.add_argument('-t', '--title', default='引用集锦', help='电子书标题')

    args = parser.parse_args()

    # 创建引用集合并加载数据
    collection = QuoteCollection(title=args.title)
    collection.load_from_json(args.json_file)

    if not collection.quotes:
        print("没有找到引用，无法生成电子书")
        return

    # 生成EPUB
    generator = EpubGenerator(collection)
    output_path = generator.generate_epub(args.output)
    print(f"电子书已生成: {output_path}")


if __name__ == "__main__":
    main()


"""
python quotes_to_epub.py src/assets/quotes.json
"""