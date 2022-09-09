from flask import Flask, request, jsonify
from datetime import datetime
import json
import boto3
import pandas as pd

# Fill with your S3 Credentials
AWS_SERVER_PUBLIC_KEY = ""
AWS_SERVER_SECRET_KEY = ""

app = Flask(__name__)

s3 = boto3.resource('s3', region_name='us-west-2', aws_access_key_id=AWS_SERVER_PUBLIC_KEY,
                    aws_secret_access_key=AWS_SERVER_SECRET_KEY)


@app.route('/', methods=['POST'])
def save_data_to_s3():  # put application's code here

    # Replace with your access management
    if request.headers['Authorization'] == "myaccesstoken":

        # Get request json body
        json_data = request.json["data"]
        # S3 file upload
        file_name = f'{request.json["userId"]}-{datetime.now()}'

        json_file = s3.Object('iapp-pocs', f'kaya/json/{file_name}.json')
        csv_file = s3.Object('iapp-pocs', f'kaya/csv/{file_name}.csv')

        # Upload Json data with all raw fields, just in case you would need raw data
        json_file.put(Body=(bytes(json.dumps(json_data).encode('UTF-8'))))

        # Transform Json to Csv
        csv_data = pd.read_json(json.dumps([(x["unifiedFields"].update({
            "id" : x["id"], # Adding important fields
            "url" :  x["url"] if ("url" in x) else ""
        }) or x["unifiedFields"]) for x in json_data])).to_csv(index=False)

        # Upload CSV with Unified Fields
        csv_file.put(Body=csv_data)
        return jsonify(", ".join(list(set().union(*[set(x.keys()) for x in json_data]))))
    return "Error"

if __name__ == '__main__':
    app.run()
