"""
NOTES:
- Arbitrary values used for sample-by-group selection
- Higher priority score = included first
- Can literally be something -1*(N months since upload + N months since collection)
"""
import argparse
from collections import defaultdict
from random import shuffle

import numpy as np
import pandas as pd

if __name__ == '__main__':
    parser = argparse.ArgumentParser(
        description="generate priorities files based on recent collection date and/or recent upload date (currently equally weighted)",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter
    )
    parser.add_argument("--metadata", type=str, required=True, help="tsv with input metadata")
    parser.add_argument("--output", type=str, required=True, help="tsv file with the priorities")
    args = parser.parse_args()

    metadata = pd.read_csv(args.metadata, sep='\t', index_col=0)
    today = datetime.date.today()

    with open(args.output, 'w') as fh:
    for idx, row in metadata.iterrows():
        upload_date = row['upload'].strptime('%Y-%m-%d')
        days_since_upload = today - upload_date

        collection_date = row['collection_date'].strptime('%Y-%m-%d')
        days_since_collection = today - collection_date

        priority = -1*(days_since_upload+days_since_collection)

        fh.write(f"{name}\t{pr+i*crowding:1.2f}\n")
