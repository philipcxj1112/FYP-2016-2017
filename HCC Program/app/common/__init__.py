#!/usr/bin/env python
# coding:utf-8
from __future__ import unicode_literals
from flask import render_template,request

import requests
import json

def api_action(action,params={}):
	url = 'http://0.0.0.0:5000/api'
	headers = {"Content-Type": "application/json"}
	data = {
    	"jsonrpc": 2.0,
    	"method": action,
    	"id": 1,
    	"auth": None,
    	"params": params}
	r = requests.post(url,headers=headers,json = json.dumps(data))
	if str(r.status_code)=='200':
		ret = json.loads(r.content)
		if ret.has_key('result'):
			return ret['result']
		else:
			return ret["error"]
	else:
		return ""

def process_result(data,output):
	black = ['_sa_instance_state']
	ret = []
	output=[]
	for obj in data:
		if output:
			tmp = {}
			for f in output:
				tmp[f] = getattr(obj, f)
			ret.append(tmp)
		else:
			tmp = obj.__dict__
			for p in black:
				try:	
					tmp.pop(p)
				except:pass
			ret.append(tmp)
	return ret