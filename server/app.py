from flask import Flask, Request, Response, render_template, jsonify, json
from flask_restful import Resource, Api, reqparse
from flask_cors import CORS
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import pandas as pd
import numpy as np
from scipy import stats
from sklearn.neighbors.kde import KernelDensity
import glob

app = Flask(__name__)
api = Api(app)

data = pd.read_csv('../data/Sensor_Weather_Data_Challenge.csv', index_col = 0, parse_dates = True)
features = list(data.columns)

class FetchData(Resource):
    def get(self, date, feature = 0, bandwidth = 10):
        data = pd.read_csv('../data/Sensor_Weather_Data_Challenge.csv', index_col = 0, parse_dates = True)
        features = list(data.columns)
        day = {}
        self.feature = int(feature)
        self.bandwidth = bandwidth
        df_day = data[date].iloc[:, self.feature]
        df_month = data[date[0:7]].iloc[:, self.feature]
        stats_day = {"min": np.min(df_day),
                "mean": np.mean(df_day),
                "median": np.median(df_day),
                "std": np.std(df_day),
                "max": np.max(df_day)}
                
        std = df_month.std()
        X_lim = [min(df_month.min(), df_day.min())- std, max(df_day.max(), df_month.max()) + std]
        self.X_ax = np.linspace(X_lim[0], X_lim[1] ,1000)[:, np.newaxis]
        #kernel density estimation
        df_kde = pd.DataFrame(data = {"x" : self.X_ax.flatten(), 
                      "m" : self.getKDE(df_month), 
                      "d" : self.getKDE(df_day)})
        return {"x_lim" : X_lim, "stats": stats_day, "df" : df_kde.melt(id_vars="x").values.tolist()}

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
    return render_template('index.html', len = len(features), features = features)

if __name__ == "__main__":
    app.run(debug = True)
