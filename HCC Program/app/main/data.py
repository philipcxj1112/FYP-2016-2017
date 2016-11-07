#!/usr/bin/env python
# coding:utf-8
import sys
reload(sys)
sys.setdefaultencoding('utf8')

# from __future__ import unicode_literals
import os
from flask import render_template, session, redirect, url_for, current_app, request, send_from_directory, request, jsonify
from .. import db
from .forms import NameForm
from . import main
from app.models import User, Teacher, Student, Student_lecture, Student_log, Student_profile, Student_study,Picture
from app import auth
from decorators import admin_required, permission_required
from app.models import Permission, Student, User, Student_profile, Student_lecture, Student_study
from flask.ext.login import login_user, logout_user, login_required, \
    current_user
import requests
from ..email_order import send_email
from werkzeug import secure_filename
from app.utils import *
from app.common import *
import copy

from datetime import date,datetime



class CjsonEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime):
            return obj.strftime("%Y-%m-%d %H:%M:%S")
        if isinstance(obj, date):
            return obj.strftime("%Y-%m-%d")
        else:
            return json.JSONEncoder.default(self,obj)



@main.route("/student_data", methods=["GET", "POST"])
def student_data():
    username = request.args.get("username")
    data_date = []
    datadate = db.session.query(Student_log.date, Student_log.picture).filter(
        Student_log.username == username).order_by(Student_log.date.desc()).all()
    for i in datadate:
        if i[0] not in data_date:
            data_date.append(i[0].encode("utf8"))
    return render_template("student/student_data.html",name = username,datadate=data_date)


@main.route("/student_data1", methods=["GET", "POST"])
def student_data1():
    from collections import Counter
    name = request.form.get("username")
    data_date = []
    data_picture = []
    datadate = db.session.query(Student_log.date, Student_log.picture).filter(
        Student_log.username == name).order_by(Student_log.date.desc()).all()
    for i in datadate:
        if i[0] not in data_date:
            data_date.append(i[0].encode("utf8"))
    for j in datadate:
        if j[1] not in data_picture:
            data_picture.append(j[1].encode("utf8"))
    picture = []
    for i in data_picture:
        d = {
            "name": i,
            "type": "bar",
            "data": []
        }
        for j in data_date:
            count = db.session.query(db.func.count('*')).select_from(Student_log).filter(
                Student_log.username == name, Student_log.date == j, Student_log.picture == i).all()
            num = count[0][0]
            d["data"].append(num)
        picture.append(d)
    new = copy.deepcopy(picture)
    for n in new:
        n["stack"] = "total"
        picture.append(n)
    data_picture.append("total")

    return jsonify(date=json.dumps(data_date), picture=json.dumps(picture), data_picture=json.dumps(data_picture))



@main.route("/student_data2", methods=["GET", "POST"])
def student_data2():
    username = request.form.get("username")
    date = request.form.get("date")
    print date
    picture = []
    data=[]
    datadate = db.session.query(Student_log.picture).filter(
        Student_log.username == username,Student_log.date==date).all()
    print datadate
    for j in datadate:
        if j[0] not in picture:
            picture.append(j[0].encode("utf8"))
    print picture
    total=[]
    for i in picture:
        d ={}
        count = db.session.query(db.func.count('*')).select_from(Student_log).filter(Student_log.username == username, Student_log.date == date, Student_log.picture == i).scalar()
        d = {
                "value": count,
                "name": i
              }
        total.append(d)
    print total
    return jsonify(picture=picture,total=total)


@main.route("/student_data3", methods=["GET", "POST"])
def student_data3():
    username = request.form.get("username")
    picture = db.session.query(Picture.id,Picture.name).all()
    picture_d = {}
    picture_img = []
    for i in picture:
        picture_d[i[1]]=i[0]
        picture_img.append(i[1])
    data = db.session.query(Student_log.picture,Student_log.date,Student_log.time).filter(Student_log.username == username).first()
    datadate=[]
    dataid=[]
    for j in data:
        datadate.append(picture_d[j[0]])
        dataid.append(i[1]+' '+i[2])
    print datadate
    return jsonify(datadate=datadate,dataid=dataid,picture=picture_img)






@main.route("/realtime_data",methods=["GET","POST"])
def realtime_data():
    if request.method == "POST": 
        res = db.session.query(Student_log).order_by("id desc").limit(10).all()
        data = process_result(res, [])
        result = db.session.query(Picture.name,Picture.address).all()
        picture = dict(result)
        for i in data:
            i["address"]=picture[i.get("picture")]
    # print data
        print picture
        return json.dumps(picture)
    return 404





















