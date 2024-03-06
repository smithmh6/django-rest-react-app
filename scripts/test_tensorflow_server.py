"""
Test request to Tensorflow model server running on VM via Docker.
"""

import json
import numpy as np
import requests

def main():
    """
    main script
    """

    # set up the request data
    data = {"instances": [[[float(x) for x in range(30)]]]}
    print(f"Input Shape: {np.shape(data['instances'])}")

    payload = json.dumps(data)
    url = "http://10.75.25.20:8501/v1/models/purchase_lstm_forecast_model:predict"
    headers = {"content-type": "application/json"}
    
    for i in range(30):
        # make a post request
        response = requests.post(url, data=payload, headers=headers)

        # get the json content
        print(f"Response:\n{response.json()}")

if __name__ == "__main__":
    main()
