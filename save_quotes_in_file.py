# *_*coding:utf-8 *_*
# @Author: SZJ
from __future__ import absolute_import, division, print_function

import json
import random
import string
from pathlib import Path


class QuotesSaver:
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

    def generate_random_filename(self, length=8):
        """
        生成随机文件名。

        :param length: 随机字符串的长度，默认为8。
        :return: 随机生成的文件名。
        """
        letters = string.ascii_lowercase
        return '来源quotes_' + ''.join(
            random.choice(letters) for _ in range(length)) + '.md'

    def save_quotes(self, output_dir):
        """
        遍历self.data并将每个引用保存到单独的Markdown文件中。

        :param output_dir: 输出目录的路径。
        """
        output_path = Path(output_dir)
        output_path.mkdir(parents=True, exist_ok=True)

        for item in self.data:
            quote = item.get('quote', '')
            author = item.get('author', '')
            if quote:
                filename = 'quotes_' + '_'.join(quote[:12]
                                                .replace('。', '')
                                                .replace('；', '')
                                                .replace('：', '')
                                                .replace('[', '')
                                                .replace(']', '')
                                                .replace('.', '')
                                                .replace('《', '')
                                                .replace('》', '')
                                                .replace('“', '')
                                                .replace('”', '')
                                                .replace('，', '').split(' ')) + '.md'
                # filename = self.generate_random_filename()
                file_path = output_path / filename
                with file_path.open('w', encoding='utf-8') as file:
                    if '佚名' in author:
                        file.write(f"{quote}")
                    else:
                        file.write(f"{quote}\n\n--{author}")
                print(f"Quote saved to: {file_path}")


if __name__ == '__main__':
    source_dir = Path.home() / 'Downloads' / f'quotes'
    source_dir.mkdir(exist_ok=True, parents=True)

    quotes_saver = QuotesSaver('src/assets/quotes.json')
    quotes_saver.save_quotes(source_dir)
    print('well done!!!')




