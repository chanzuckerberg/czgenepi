import csv
from io import StringIO
from typing import Any, Callable, Iterable, Mapping, Optional, Set

from flask import g, jsonify, request, Response, stream_with_context

from aspen.database.connection import session_scope


class SimpleStringWriter:
    def __init__(self):
        self.contents = []

    def write(self, data):
        self.contents.append(data)

    def read(self):
        for line in self.contents:
            yield line
        self.contents = []


class TSVStreamer:
    fields: Iterable[str] = []

    def __init__(self, filename: str, data):
        self.filename = filename
        self.data = data

    def get_response(self):
        generator = self.stream()
        resp = Response(generator, mimetype="application/binary")
        resp.headers["Content-Disposition"] = f"attachment; filename={self.filename}"
        resp.headers["Content-Type"] = "text/tsv"
        return resp

    def writerow(self):
        raise NotImplementedError("Must override writerow")

    @stream_with_context
    def stream(self):
        stringfh = SimpleStringWriter()
        csvwriter = csv.DictWriter(stringfh, self.fields, delimiter="\t")
        csvwriter.writeheader()
        for item in self.data:
            csvdata: Mapping[str, Any] = self.generate_row(item)
            csvwriter.writerow(csvdata)
            for res in stringfh.read():
                yield res


class MetadataTSVStreamer(TSVStreamer):
    fields = ["Sample Identifier", "Selected"]

    def __init__(self, filename: str, data: Iterable, selected: Iterable):
        super().__init__(filename, data)
        self.selected = selected

    def generate_row(self, item):
        data: Mapping[str, Any] = {
            "Sample Identifier": item,
            "Selected": "y" if item in self.selected else "n",
        }
        return data
