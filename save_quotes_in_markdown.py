# *_*coding:utf-8 *_*
# @Author: SZJ
from __future__ import absolute_import, division, print_function

import json
import random
import string
import shutil
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

    def shuffle_quotes(self):
        """
        随机打乱引用数据的顺序。
        """
        random.shuffle(self.data)
        return self.data

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
                .replace('"', '')
                .replace('"', '')
                .replace('，', '').split(
                    ' ')) + '.md'
                # filename = self.generate_random_filename()
                file_path = output_path / filename
                with file_path.open('w', encoding='utf-8') as file:
                    if '佚名' in author:
                        file.write(f"{quote}")
                    else:
                        file.write(f"{quote}\n\n--{author}")
                print(f"Quote saved to: {file_path}")

    def save_quotes_to_single_file(self, output_dir, shuffle=True):
        """
        将所有引用保存到单个quotes.md文件中。

        :param output_dir: 输出目录的路径。
        :param shuffle: 是否打乱引用顺序，默认为True。
        """
        output_path = Path(output_dir)
        output_path.mkdir(parents=True, exist_ok=True)

        file_path = output_path / 'quotes.md'

        # 如果需要打乱顺序
        if shuffle:
            self.shuffle_quotes()
            print("数据已随机打乱")

        with file_path.open('w', encoding='utf-8') as file:
            for item in self.data:
                quote = item.get('quote', '')
                author = item.get('author', '')
                if quote:
                    if '佚名' in author:
                        file.write(f"{quote}\n\n\n")
                    else:
                        file.write(f"{quote}\n--{author}\n\n\n")

        print(f"All quotes saved to: {file_path}")

        # 复制cover.jpg到quotes.md所在目录
        cover_src = Path('src/assets/cover.jpg')
        cover_dst = output_path / 'cover.jpg'

        try:
            shutil.copy2(cover_src, cover_dst)
            print(f"Cover image copied to: {cover_dst}")
        except FileNotFoundError:
            print(f"警告: 封面图片文件 {cover_src} 未找到")
        except Exception as e:
            print(f"复制封面图片时出错: {e}")


if __name__ == '__main__':
    source_dir = Path.home() / 'Downloads' / f'quotes'
    source_dir.mkdir(exist_ok=True, parents=True)

    quotes_saver = QuotesSaver('src/assets/quotes.json')
    quotes_saver.save_quotes_to_single_file(source_dir, shuffle=True)
    print('well done!!!')


