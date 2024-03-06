"""
This module contains utility functions used
in the MOE app.
"""

import csv
from django.core.files.storage import default_storage
import io
import pathlib

def open_cloud_file(file_path):
    """
    Opens a BLOB file from database field.

    Parameters
    ------------
    file_path (path): the path to the file within the
        BLOB container as specified within the database.\n

    Returns
    -------------
    (tuple) (stream, extension, delimiter)\n
    stream: the io stream containing file data.\n
    extension: the file's extension.\n
    delimiter: the delimiter used to parse file.
    """

    # define variable to store encoding type
    # and delimiter type
    code_type = None
    del_type = None


    # get the extension of the file
    ext = pathlib.Path(file_path.name).suffix.lower()

    # check the file type, and set decoder
    if 'spa' in ext:
        code_type = 'mbcs'
    else:
        code_type = 'utf-8'

    f = default_storage.open(file_path.name).read().decode(code_type)
    f_stream = io.StringIO(f)

    dialect = csv.Sniffer().sniff(f)
    del_type = dialect.delimiter
    #csvfile.seek(0)

    return (f_stream, ext, del_type)
