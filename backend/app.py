from flask import Flask, request, jsonify
from datetime import datetime
import json
import pandas as pd
from settings import GOOGLE_KEY
from google.cloud import storage
from google.oauth2 import service_account

app = Flask(__name__)


credentials = service_account.Credentials.from_service_account_file("YOUR_GCP_CREDENTIALS_FILE_HERE")

storage_client = storage.Client(project=None, credentials=credentials)
bucket = storage_client.bucket("kaya-1")


@app.route('/', methods=['POST'])
def save_data_to_s3():  # put application's code here

    # Replace with your access management
    if request.headers['Authorization'] == "myaccesstoken":

        # Get request json body
        json_data = request.json["data"]
        # S3 file upload
        file_name = f'{request.json["userId"]}-{datetime.now()}'

        # Upload Json data with all raw fields, just in case you would need raw data
        #json_file.put(Body=(bytes(json.dumps(json_data).encode('UTF-8'))))
        json_blob = bucket.blob(f'kaya/json/{file_name}.json')
        json_blob.upload_from_string(bytes(json.dumps(json_data).encode('UTF-8')))

        # Transform Json to Csv
        csv_data = pd.read_json(json.dumps([(x["unifiedFields"].update({
            "id" : x["id"], # Adding important fields
            "url" :  x["url"] if ("url" in x) else ""
        }) or x["unifiedFields"]) for x in json_data])).to_csv(index=False)

        # Upload CSV with Unified Fields
        csv_blob = bucket.blob(f'kaya/csv/{file_name}.json')
        csv_blob.upload_from_string(bytes(json.dumps(csv_data).encode('UTF-8')))

        return "Success"
    return "Error"

if __name__ == '__main__':
    app.run()
