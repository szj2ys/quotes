import json

class TextCleaner:
    def __init__(self, input_file_path):
        """
        初始化TextCleaner对象。

        :param input_file_path: 输入的JSON文件的路径。
        """
        self.input_file_path = input_file_path
        self.data = self._load_data()

    def _load_data(self):
        """
        从文件路径加载JSON数据。

        :return: 解析JSON后的数据。
        """
        with open(self.input_file_path, 'r', encoding='utf-8') as file:
            return json.load(file)

    def _clean_quote(self, quote):
        """
        清洗单个quote字段的文本：替换逗号。

        :param quote: 原始quote文本。
        :return: 清洗后的quote文本。
        """
        return quote.replace(',', '，').replace('.', '。').replace('?', '？')

    def _update_author(self, author):
        """
        更新单个author字段：如果为空，则替换为"佚名"。

        :param author: 原始author文本。
        :return: 更新后的author文本。
        """
        return '佚名' if not author else author

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

    def save_data(self, output_file_path):
        """
        将清洗后的数据保存到新的文件中。

        :param output_file_path: 输出的JSON文件的路径。
        """
        with open(output_file_path, 'w', encoding='utf-8') as file:
            json.dump(self.data, file, ensure_ascii=False, indent=4)


# 使用示例
if __name__ == "__main__":
    cleaner = TextCleaner('quotes.json')  # 输入文件名
    cleaner.clean_data()
    cleaner.save_data('quotes_cleaned.json')  # 输出文件名