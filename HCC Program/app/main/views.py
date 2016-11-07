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
from app.models import User, Teacher, Student, Student_lecture, Student_log, Student_profile, Student_study,Picture,Music
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

ALLOWED_EXTENSIONS = set(['png','jpg','mp3'])
UPLOAD_FOLDER = '/Users/songxiang/Desktop/hccproject/app/static/image/'
DOWNLOAD_FOLDER = 'static/image/'
UPLOAD_FOLDER_MUSIC = '/Users/songxiang/Desktop/hccproject/app/static/music/'
DOWNLOAD_FOLDER_MUSIC = 'static/music/'

@main.route("/", methods=["GET", "POST"])
def login():
    return redirect(url_for('auth.login'))


@main.route("/index", methods=["GET", "POST"])
def index():
    return render_template("index.html")


@main.route("/student_table", methods=["GET", "POST"])
def student_table():
    res = db.session.query(Student_profile).order_by("id desc").all()
    db.session.close()
    data = process_result(res, [])
    print data
    return render_template("student/student_table.html", student=data)


@main.route("/add_student", methods=["GET", "POST"])
def add_student():
    return render_template("/student/add_student.html")


@main.route("/add_student_submit", methods=["GET", "POST"])
def add_student_submit():
    username = request.form.get("username")
    password = request.form.get("password1")
    data = db.session.query(Student).filter(Student.username == username).all()
    if data:
        return "這個學生已經存在"
    else:
        res = Student(username=username, password=password)
        db.session.add(res)
        try:
            db.session.commit()
        except Exception, e:
            return Exception(e.message.split(")")[1])
    return render_template("student/add_student.html")


@main.route("/add_log", methods=["GET", "POST"])
def add_log():
    username = request.args.get("username")
    ibeacon = request.args.get("ibeacon")
    picture = request.args.get("picture")
    situation = request.args.get("situation")
    date = request.args.get("date")
    time = request.args.get("time")
    data = db.session.query(Student.id).filter(
        Student.username == username).first()
    print username, ibeacon, picture, situation, date, time, data
    if data:
        res = Student_log(username=username, ibeacon=ibeacon, picture=picture,
                          situation=situation, date=date, time=time, user_id=data[0])
        db.session.add(res)
        try:
            db.session.commit()
        except Exception, e:
            return Exception(e.message.split(")")[1])
        return "ok"
    else:
        return "this student can not find"


@main.route("/add_profile", methods=["GET", "POST"])
def add_profile():
    username = request.form.get("username")
    print username
    return render_template("student/add_profile.html", name=username)


@main.route("/add_profile_submit", methods=["GET", "POST"])
def add_profile_submit():
    username = request.form.get("username")
    father_number = request.form.get("father_number")
    mother_number = request.form.get("mother_number")
    student_id = request.form.get("student_id")
    address = request.form.get("address")
    email = request.form.get("email")
    gender = request.form.get("gender")
    evaluate = request.form.get("evaluate")
    student_class = request.form.get("student_class")
    language_level = request.form.get("language_level")
    user_id = db.session.query(Student.id).filter(
        Student.username == username).first()
    print user_id[0], username, father_number, mother_number, student_id, address, email, gender, evaluate
    res = Student_profile(username=username, father_number=father_number, mother_number=mother_number, student_id=student_id, address=address,
                          email=email, gender=gender, evaluate=evaluate, student_class=student_class, language_level=language_level, user_id=user_id[0])
    db.session.add(res)
    try:
        db.session.commit()
    except Exception, e:
        return Exception(e.message.split(")")[1])
    return render_template("student/add_profile_list.html")


@main.route("/add_profile_list", methods=["GET", "POST"])
def add_profile_list():
    data = db.session.query(Student.username).all()
    allready = db.session.query(Student_profile.username).all()
    namelist = []
    print data
    for i in data:
        if i not in allready:
            print i[0]
            namelist.append(i[0])
    print namelist
    return render_template("student/add_profile_list.html", namelist=namelist)

@main.route("/show_picture",methods=["GET","POST"])
def show_picture():
    data = db.session.query(Picture.name,Picture.address).filter(Picture.situation=="canteen").all()
    data1 = db.session.query(Picture.name,Picture.address).filter(Picture.situation=="playground").all()
    data2 = db.session.query(Picture.name,Picture.address).filter(Picture.situation=="classroom").all()
    return render_template("picture/show_picture.html",pictures=data,pictures1=data1,picture2=data2)
@main.route("/add_picture",methods=["GET","POST"])
def add_picture():
    return render_template("picture/add_picture.html")

@main.route("/add_picture_submit",methods=["GET","POST"])
def add_picture_submit():
    def allowed_file(filename):
        return '.' in filename and filename.rsplit('.',1)[1] in ALLOWED_EXTENSIONS
    if request.method == 'POST':
        file = request.files['file']
        file_m = request.files['file1']
        address = request.form.get("address")
        name = request.form.get("title")
        if file and allowed_file(file.filename) and file_m and allowed_file(file_m.filename):
            filetype = file.filename.rsplit('.',1)[1]
            filetype_m = file_m.filename.rsplit('.',1)[1]
            # 文档格式
            filename = secure_filename(file.filename)
            filename_m = secure_filename(file_m.filename)
            # 文件类型admin/product
            savename = name+"."+filetype
            savename_m = name+"."+filetype_m
            savepath = UPLOAD_FOLDER+address+"/"+savename
            address_p = DOWNLOAD_FOLDER+address+"/"+savename
            savepath_m = UPLOAD_FOLDER_MUSIC+address+"/"+savename_m
            address_m = DOWNLOAD_FOLDER_MUSIC+address+"/"+savename_m
            count1 = db.session.query(db.func.count('*')).select_from(Picture).filter(Picture.name==name).scalar()
            count2 = db.session.query(db.func.count('*')).select_from(Music).filter(Music.name==name).scalar()
            print "save name is ",savename
            print "save path is ",savepath
            if count1 > 0 and count2 >0:
                return "该文件已经存在，如果想继续储存，请修改文件英文名称"
            else:
                try:
                    pic = Picture(name=name,
                              situation=address,
                              address=address_p)
                    music = Music(name=name,
                              situation=address,
                              address=address_m)
                    db.session.add(pic)
                    db.session.add(music)
                    db.session.commit()
                except Exception, e:
                    raise e
                    # raise Exception("该文件已经存在")
                file.save(savepath)
                file_m.save(savepath_m)
                return redirect(url_for("main.add_picture"))
    return render_template("picture/add_picture.html")


@main.route('/load_image',methods=["GET","POST"])
def load_image():
    situation = request.args.get("situation")
    data = db.session.query(Picture.name).filter(Picture.situation==situation).all()
    jsondata = []
    for i in data:
        d = {}
        d = {"picture_name":i[0]}
        jsondata.append(d)
    return jsonify(data=jsondata,status="OK")

@main.route('/download_image',methods=['POST','GET'])
def download_image():
    name = request.args.get("imagename")
    filename = name+".png"
    address = db.session.query(Picture.situation).filter(Picture.name==name).first()
    path = UPLOAD_FOLDER+address[0]+"/"
    print path,filename
    return send_from_directory(path,filename)

@main.route('/load_music',methods=["GET","POST"])
def load_music():
    situation = request.args.get("situation")
    data = db.session.query(Music.name).filter(Music.situation==situation).all()
    jsondata = []
    for i in data:
        d = {}
        d = {"picture_name":i[0]}
        jsondata.append(d)
    return jsonify(data=jsondata,status="OK")

@main.route('/download_music',methods=['POST','GET'])
def download_music():
    name = request.args.get("musicname")
    filename = name+".png"
    address = db.session.query(Music.situation).filter(Music.name==name).first()
    path = UPLOAD_FOLDER_MUSIC+address[0]+"/"
    print path,filename
    return send_from_directory(path,filename)

@main.route("/show_profile", methods=["GET", "POST"])
def show_profile():
    res = db.session.query(Student_profile).order_by("id desc").all()
    db.session.close()
    data = process_result(res, [])
    print data
    return render_template("student/student_table1.html", student=data)

@main.route("/show_profile_submit", methods=["GET", "POST"])
def show_profile_submit():
    name = request.args.get("username")
    print name
    res = db.session.query(Student_profile).filter(Student_profile.username==name).first()
    db.session.close()
    print res
    return render_template("student/edit_profile.html", student=res)
@main.route("/edit_profile", methods=["GET", "POST"])
def edit_profile():
    name = request.form.get("username")
    print name
    res = db.session.query(Student_profile).filter(Student_profile.username==name).first()
    db.session.close()
    print res
    return render_template("student/edit_profile1.html", student=res)
@main.route("/edit_profile_submit", methods=["GET", "POST"])
def edit_profile_submit():
    username = request.form.get("username")
    father_number = request.form.get("father_number")
    mother_number = request.form.get("mother_number")
    student_id = request.form.get("student_id")
    address = request.form.get("address")
    email = request.form.get("email")
    gender = request.form.get("gender")
    evaluate = request.form.get("evaluate")
    student_class = request.form.get("student_class")
    language_level = request.form.get("language_level")
    user_id = db.session.query(Student.id).filter(Student.username == username).first()
    print user_id[0], username, father_number, mother_number, student_id, address, email, gender, evaluate
    res ={"username":username,
        "father_number":father_number, 
        "mother_number":mother_number, 
        "student_id":student_id, 
        "address":address,
        "email":email, 
        "gender":gender, 
        "evaluate":evaluate, 
        "student_class":student_class, 
        "language_level":language_level, 
        "user_id":user_id[0]}
    db.session.query(Student_profile).filter(Student_profile.user_id==user_id[0]).update(res)
    try:
        db.session.commit()
    except Exception, e:
        return Exception(e.message.split(")")[1])
    return render_template("student/add_profile_list.html")


@main.route("/realtime",methods=["GET","POST"])
def realtime():
    return render_template("picture/realtime_picture.html")













