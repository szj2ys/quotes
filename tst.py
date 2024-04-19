# *_*coding:utf-8 *_*
# @Author: SZJ
from __future__ import absolute_import, division, print_function
from os.path import dirname, abspath, join

ROOT = dirname(abspath(__file__))
from datetime import timedelta, datetime
import pandas as pd
import numpy as np
from tqdm import tqdm
import warnings

warnings.filterwarnings('ignore')
warnings.simplefilter('ignore')
pd.set_option("display.max_columns", None)
# pd.set_option("display.max_rows", None)
pd.set_option("display.float_format", lambda x: "{:.2f}".format(x))


def function():
    pass


if __name__ == "__main__":
    starttime = (datetime.now() + timedelta(days=-1)).strftime(
        "%Y-%m-%d %H:%M:%S")
    str2date = datetime.strptime("2019-03-17 11:00:00", "%Y-%m-%d %H:%M:%S")
