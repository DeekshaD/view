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
import pickle


app = Flask(__name__)
api = Api(app)

#get feature calumns for initial load
data = pd.read_csv('../data/Sensor_Weather_Data_Challenge.csv', index_col = 0, parse_dates = True)
features = list(data.columns)

class FetchData(Resource):
    def get(self, date, feature = 0, bandwidth = 10):
        day = {}
        self.feature = int(feature)
        self.bandwidth = bandwidth
        
        #subset to day and month
        day = data[date]
        df_day = data[date].iloc[:, self.feature]
        df_month = data[date[0:7]].iloc[:, self.feature]
       
        #Start: Data for arcs#
        #subsetting a few features for weather highlights
        cols = ['temperature', 'humidity', 'visibility', 'wind_speed', 'wind_direction', 'storm_direction']
       
        #Define global maximum for these features
        global_max = [100, 100, 15, 100, 360, 360]

        #get stats for weather features
        weather_data = day.loc[:, cols].describe()
        weather_data.columns = ["Temperature", "Humidity", "Visibility", "Wind Speed", "Wind Direction","Storm Direction"]
        weather_data.loc["global_max", :] = global_max
        #End: Data for arcs#

        #Start: Data for density plots and respective stats#
        #get statistics for a particular feature in the day
        stats_day = {"min": np.min(df_day),
                "mean": np.mean(df_day),
                "median": np.median(df_day),
                "std": np.std(df_day),
                "max": np.max(df_day)}
        std = df_month.std()

        #define limits for X axis as a function of month and day limits
        X_lim = [min(df_month.min(), df_day.min())- std, max(df_day.max(), df_month.max()) + std]
        
        #kernel density estimation
        self.X_ax = np.linspace(X_lim[0], X_lim[1] ,1000)[:, np.newaxis]
        df_kde = pd.DataFrame(data = {"x" : self.X_ax.flatten(), 
                      "m" : self.getKDE(df_month), 
                      "d" : self.getKDE(df_day)})
        #End: Data for density plots and respective stats#
       
        #convery to dict
        data_dict = {"x_lim" : X_lim, 
                "stats": stats_day, 
                "df" : df_kde.melt(id_vars="x").values.tolist(),
                "weather": weather_data.transpose().to_dict(orient="index")
}

        return data_dict

    def getKDE(self, df):
        #get probabilites for each value of x in X axis
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
