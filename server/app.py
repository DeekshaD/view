from flask import Flask, Request, Response, render_template, jsonify, json
from flask_restful import Resource, Api, reqparse
from flask_cors import CORS
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import pandas as pd
import numpy as np
from sklearn.neighbors.kde import KernelDensity
import glob

app = Flask(__name__)
api = Api(app)

class FetchData(Resource):
    def get(self, date, feature = 0, bandwidth = 10):
        data = pd.read_csv('../data/Sensor_Weather_Data_Challenge.csv', index_col = 0, parse_dates = True)
        day = {}
        self.feature = int(feature)
        self.bandwidth = bandwidth
        df_day = data[date].iloc[:, self.feature]
        df_month = data[date[0:7]].iloc[:, self.feature]
        std = df_month.std()
        X_lim = [df_month.min() - std, df_month.max() + std]
        self.X_ax = np.linspace(X_lim[0], X_lim[1] ,1000)[:, np.newaxis]
        #kernel density estimation
        df_kde = pd.DataFrame(data = {"x" : self.X_ax.flatten(), 
                      "m" : self.getKDE(df_month), 
                      "d" : self.getKDE(df_day)})
        return {"x_lim" : X_lim, "df" : df_kde.to_dict(orient="index")}

    def getKDE(self, df):
        vals = df.values.reshape((-1,1))
        kde = KernelDensity(bandwidth = self.bandwidth)
        kde.fit(vals)
        prop = kde.score_samples(self.X_ax)
        return np.exp(prop)


api.add_resource(FetchData, '/main/date=<date>',
                            '/main/date=<date>/feature=<feature>')
@app.route('/main')
def selectDate():
    return render_template('index.html')
if __name__ == "__main__":
    app.run(debug = True)
