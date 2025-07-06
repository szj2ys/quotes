import json, string
from pathlib import Path
from datetime import datetime
from opencc import OpenCC
import re
import pyperclip


class ChineseConverter:
    """pip install opencc-python-reimplemented"""

    def __init__(self, config='t2s'):
        """
        config：- t2s：繁体转简体
                    - s2t：简体转繁体
        """
        self.converter = OpenCC(config)

    @classmethod
    def convert(cls, text):
        """中文字体转换"""
        return cls().converter.convert(text)


class TextCleaner:
    def __init__(self, input_file_path):
        """
        初始化TextCleaner对象。

        :param input_file_path: 输入的JSON文件的路径。
        """
        self.input_file = Path(input_file_path)
        self.data = self._load_data()

    def _load_data(self):
        """
        从文件路径加载JSON数据。

        :return: 解析JSON后的数据。
        """
        with self.input_file.open(encoding='utf-8') as file:
            return json.load(file)

    @staticmethod
    def format_comma(text):
        new_text = ""
        for i in range(len(text)):
            if text[i] == ',':
                before_wd = text[i - 1]
                if i > 0 and before_wd.isdigit() or before_wd in string.ascii_lowercase + string.ascii_uppercase:
                    new_text += text[i]
                else:
                    # 如果逗号前的字符存在并且不是数字或字母，则替换
                    new_text += '，'
            else:
                new_text += text[i]
        return new_text

    def check_end_punctuation(self, text):
        """检查是否以标点结尾"""
        chinese_puncts = ['。', '！', '？', '”']

        # 判断是否以标点符号结尾
        if text and (
                text[-1] not in string.punctuation and (
                text[-1] not in chinese_puncts)):
            return text + '。'
        else:
            return text

    def _clean_quote(self, quote):
        """
        清洗单个quote字段的文本：替换逗号。

        :param quote: 原始quote文本。
        :return: 清洗后的quote文本。
        """
        quote = quote.replace(';', '；'). \
            replace('?', '？').replace('!', '！').replace(':', '：'). \
            replace('"', '”').replace('\\n', '\n').replace('；。', '。'). \
            replace('？。', '。').replace('(', '（').replace(')', '）')
        quote = re.sub(r'[\u2460-\u24FF]', '', quote)
        quote = self.convert_full_stop(quote)
        quote = self.format_comma(quote)
        quote = ChineseConverter.convert(quote)
        # if any(c.isalpha() for c in quote if c.isascii()):
        #     # 检查quote是否包含字母
        #     print(quote)

        return self.check_end_punctuation(quote.strip()) \
            .replace('。NET', '.NET').replace('。”。', '。”')

    def _update_author(self, author):
        """
        更新单个author字段：如果为空，则替换为"佚名"。

        :param author: 原始author文本。
        :return: 更新后的author文本。
        """
        author = '佚名' if not author else author

        return author.replace('・', '·').replace('•', '·').strip()

    def convert_full_stop(self, text):
        result = ""
        for i in range(len(text)):

            if text[i] == '.':
                if i == 0:
                    result += text[i]
                elif i < len(text) - 1 and (
                        text[i - 1] == '.' or text[i + 1] == '.'):
                    # 处理省略号的情况
                    result += text[i]
                elif not text[i - 1].isdigit() \
                        and not text[i - 1] == '.' \
                        and not text[i - 1] in string.ascii_lowercase + string.ascii_uppercase:
                    result += '。'
                else:
                    result += text[i]
            else:
                result += text[i]
        return result

    def clean_data(self):
        """
        执行清洗数据的完整流程。
        """
        cleaned_data = []
        seen_quotes = set()
        for item in self.data:
            quote = item['quote']
            if quote and quote not in seen_quotes:
                seen_quotes.add(quote)
                cleaned_item = {
                    'quote': self._clean_quote(quote),
                    'author': self._update_author(item['author'])
                }
                cleaned_data.append(cleaned_item)

        self.data = cleaned_data

    def save_data(self):
        """
        将清洗后的数据保存到新的文件中。
        """
        output_file = self.input_file.parent / f'quotes.json'
        self.input_file.rename(
            self.input_file.parent / f'quotes_bak_{datetime.now().strftime("%Y%m%d%H%M")}.json')
        print(f'总共有{len(self.data)}条数据...')
        with output_file.open('w', encoding='utf-8') as file:
            json.dump(self.data, file, ensure_ascii=False, indent=4)
        # quotes = "\n\n\n\n".join(set(d["quote"] +'\n--' + d['author'] for d in self.data))
        quotes = "\n\n\n\n".join(set(d["quote"] for d in self.data))
        pyperclip.copy(quotes)

if __name__ == "__main__":
    cleaner = TextCleaner('public/quotes.json')  # 输入文件名
    cleaner.clean_data()
    cleaner.save_data()
    print('Well done!')
