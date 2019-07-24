from flask import Flask, Request, Response, render_template, jsonify, json
from flask_restful import Resource, Api, reqparse
from flask_cors import CORS
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import pandas as pd
import glob

app = Flask(__name__)
api = Api(app)

class FetchData(Resource):
    def get(self, date):
        data = pd.read_csv('../data/Sensor_Weather_Data_Challenge.csv', index_col = 0, parse_dates = True)
        day = {}
        day = data[date]
        day_0 = day.iloc[:,0]
        return day_0.to_json(orient="index")


api.add_resource(FetchData, '/main/date=<date>')
@app.route('/main')
def selectDate():
    return render_template('index.html')
if __name__ == "__main__":
    app.run(debug = True)
