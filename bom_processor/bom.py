import os

from flask import Flask, Response, request
import requests
import requests_ftp
import xml.etree.ElementTree as ET
from pprint import pprint
import json
import datetime


# Set up FTP
requests_ftp.monkeypatch_session()

cache = dict()


def get_cached_result(url: str) -> ET.Element:
    cached_res = cache.get(url, None)
    if cached_res is None or (datetime.datetime.now().timestamp() - cached_res[1]) > 600:
        cache[url] = (get_BOM_xml(url), datetime.datetime.now().timestamp())
        return cache[url][0]
    return cached_res[0]


def get_BOM_xml(url: str) -> ET.Element:
    s = requests.Session()
    resp = s.retr(url)
    xmltree = ET.fromstring(resp.text)
    return xmltree


def make_xml_element_dict(xml_element: ET.Element) -> dict:
    d = dict()
    d[xml_element.tag] = xml_element.attrib
    d[xml_element.tag]['text'] = xml_element.text
    d[xml_element.tag]['children'] = [make_xml_element_dict(x) for x in xml_element.getchildren()]
    return d


def get_bom_obs() -> dict:
    xmltree = get_cached_result('ftp://ftp.bom.gov.au/anon/gen/fwo/IDD60920.xml')
    obs = xmltree.find('observations')
    station = ([x for x in obs.findall('station') if x.get('stn-name') == 'DARWIN AIRPORT'])[0]

    outdict = dict()

    outdict['observation_time'] = station[0].get('time-local')
    outdict['apparent_temp'] = [x for x in station[0][0].findall('element') if x.get('type') == 'apparent_temp'][0].text
    outdict['air_temperature'] = [x for x in station[0][0].findall('element') if x.get('type') == 'air_temperature'][0].text

    return outdict


def get_bom_mini_forecast() -> dict:
    xmltree = get_cached_result('ftp://ftp.bom.gov.au/anon/gen/fwo/IDD10207.xml')
    current_forecast = [i for i in xmltree[1] if i.attrib['description'] == 'Darwin Airport'][0].getchildren()[0]

    #return current_forecast

    outdict = dict()

    outdict['forecast_icon_code'] = [x for x in current_forecast.getchildren() if x.attrib['type'] == 'forecast_icon_code'][0].text
    outdict['short_forecast'] = [x for x in current_forecast.getchildren() if x.attrib['type'] == 'precis'][0].text
    outdict['probability_of_precipitation'] = [x for x in current_forecast.getchildren() if x.attrib['type'] == 'probability_of_precipitation'][0].text

    return outdict


def get_bom_long_forecast() -> dict:
    xmltree = get_cached_result('ftp://ftp.bom.gov.au/anon/gen/fwo/IDD10198.xml')

    all_forecasts = [x for x in xmltree[1].getchildren() if x.attrib['description'] == "Darwin City and Outer Darwin"][0]
    forecastzero = [x for x in all_forecasts.getchildren() if x.attrib['index'] == '0'][0]
    forecast = [x for x in forecastzero.getchildren() if x.attrib['type'] == 'forecast'][0].text

    outdict = dict()
    outdict['long_forecast'] = forecast

    return outdict


def get_full_data() -> dict:
    obs = get_bom_obs()
    minis = get_bom_mini_forecast()
    longf = get_bom_long_forecast()

    outdict = dict()

    outdict['observation'] = obs
    outdict['mini_forecast'] = minis
    outdict['long_forecast'] = longf

    return outdict





"""Create and configure an instance of the Flask application."""
app = Flask(__name__, instance_relative_config=True)

app.config.from_mapping(
    
)

# ensure the instance folder exists
try:
    os.makedirs(app.instance_path)
except OSError:
    pass

@app.route('/bom_data')
def bom_observations():
    outputdict = get_full_data()

    return Response(json.dumps(outputdict), mimetype='application/json', headers=[('Access-Control-Allow-Origin', '*')])

@app.route('/nearby_search')
def nearby_search():
    pprint(request.headers)
    r = requests.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json', params=request.args )
    pprint(r.url)
    return Response(r.text, mimetype='application/json', headers=[('Access-Control-Allow-Origin', '*')])


@app.route('/geocode')
def geocode():
    r = requests.get('https://maps.googleapis.com/maps/api/geocode/json', params=request.args )
    return Response(r.text, mimetype='application/json', headers=[('Access-Control-Allow-Origin', '*')])


