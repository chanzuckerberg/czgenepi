import datetime
import json
import logging
import os
from typing import List

import requests

logging.basicConfig()
logging.getLogger().setLevel(logging.DEBUG)
requests_log = logging.getLogger("requests.packages.urllib3")
requests_log.setLevel(logging.DEBUG)
requests_log.propagate = True

# NOTE!-- even with an API key, the genbank API rate limits us to 10 requests/sec,
# so we'll need to contact them if/when we need to go beyond that.
# Search documentation: https://www.ncbi.nlm.nih.gov/books/NBK25499/#chapter4.ESearch
# Fetch metadata documentation: https://www.ncbi.nlm.nih.gov/books/NBK25499/#chapter4.ESummary
# Fetch sequence documentation: https://www.ncbi.nlm.nih.gov/books/NBK25499/#chapter4.EFetch


class GenbankFetcher:
    species: str
    pathogen_type: str
    min_seq_length: int = 0
    max_seq_length: int = 0

    def __init__(self, api_key: str):
        self.api_key = api_key

    def fetch_metadata(self, webenv: str, query_key: str, num_results: int):
        base_url = "https://www.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi"
        retstart = 0
        max_responses = 20  # NOTE: this is the max allowed by the api.
        while True:
            params = {
                "retmax": max_responses,
                "retmode": "json",
                "db": "nuccore",
                "usehistory": "y",
                "WebEnv": webenv,
                "query_key": query_key,
                "retstart": retstart,
            }
            if self.api_key:
                params["api_key"] = self.api_key

            response = requests.get(base_url, params=params)
            data = response.json()
            yield data["result"]
            exit()
            retstart += max_responses
            if retstart >= num_results:
                break
        return responses

    def fetch_samples(self, webenv: str, query_key: str, num_results: int):
        base_url = "https://www.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi"
        responses = ""
        retstart = 0
        max_responses = 100  # NOTE: this is the max allowed by the api.
        while True:
            start = datetime.datetime.now()
            params = {
                "retmax": max_responses,
                "rettype": "fasta",
                "retmode": "text",
                "db": "nuccore",
                "usehistory": "y",
                "WebEnv": webenv,
                "query_key": query_key,
                "retstart": retstart,
            }
            if self.api_key:
                params["api_key"] = self.api_key

            response = requests.get(base_url, params=params)
            yield response.text
            retstart += max_responses
            print(f"Time for {max_responses}: {datetime.datetime.now() - start}")
            if retstart >= num_results:
                break

    # Currently unused, but here if we need it.
    def fetch_samples_by_id(self, idlist: List):
        base_url = "https://www.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi"
        responses = ""
        retstart = 0
        max_responses = 100  # NOTE: this is the max allowed by the api.
        while True:
            start = datetime.datetime.now()
            params = {
                "rettype": "fasta",
                "retmode": "text",
                "db": "nuccore",
                "id": ",".join(idlist[retstart : (retstart + max_responses)]),
            }
            if self.api_key:
                params["api_key"] = self.api_key

            response = requests.get(base_url, params=params)
            yield response.text
            retstart += max_responses
            print(f"Time for {max_responses}: {datetime.datetime.now() - start}")
            if retstart >= num_results:
                break

    def fetch_ids(self):
        base_url = "https://www.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
        params = {
            "term": f'"{self.species}"[Organism] AND {self.pathogen_type}[filter] AND biomol_genomic[PROP] AND ddbj_embl_genbank[filter] AND is_nuccore[filter] AND ("{self.min_seq_length}"[SLEN] : "{self.max_seq_length}"[SLEN])',
            "retmax": 100000,  # NOTE: this is the max allowed by the api.
            "retmode": "json",
            "db": "nuccore",
            "usehistory": "y",
        }
        if self.api_key:
            params["api_key"] = self.api_key

        response = requests.get(base_url, params=params)
        return response.json()


class TuberculosisFetcher(GenbankFetcher):
    species = "Mycobacterium tuberculosis"
    pathogen_type = "bacteria"
    min_seq_length = 4000000
    max_seq_length = 4600000


class MonkeypoxFetcher(GenbankFetcher):
    species = "Monkeypox virus"
    pathogen_type = "viruses"
    min_seq_length = 180000
    max_seq_length = 220000


if __name__ == "__main__":
    api_key = os.environ.get("GENBANK_API_KEY")
    fetcher = MonkeypoxFetcher(api_key)
    idlist = fetcher.fetch_ids()
    num_results = int(idlist["esearchresult"]["count"])
    webenv = idlist["esearchresult"]["webenv"]
    query_key = idlist["esearchresult"]["querykey"]

    print("num_results", num_results)
    print("webenv", webenv)
    print("query_key", query_key)

    # Write fasta file
    # with open("big.fasta", "w") as f:
    #    for fasta in fetcher.fetch_samples(webenv, query_key, num_results):
    #        f.write(fasta)

    # Write metadata json
    with open("metadata.ndjson", "w") as f:
        for metadata in fetcher.fetch_metadata(webenv, query_key, num_results):
            for uid in metadata["uids"]:
                json.dump(metadata[uid], f)
                f.write("\n")
