#!/usr/bin/env python
# coding:utf-8

import os
basedir = os.path.abspath(os.path.dirname(__file__))
from flask import Flask, request, redirect, url_for
from werkzeug import secure_filename
UPLOAD_FOLDER = '/Users/songxiang/Desktop/jingzhongproject/web'

class config:
    SECRET_KEY = os.environ.get("SECRET_KDY") or "abcdefg"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_COMMIT_ON_TEARDOWN = True
    MAIL_SERVER = 'smtp.163.com'
    MAIL_PORT = 465
    MAIL_USE_TLS = False
    MAIL_USE_SSL = True
    MAIL_USERNAME = '14714319123'
    MAIL_PASSWORD = 'Sx123456'
    FLASKY_MAIL_SUBJECT_PREFIX = '[hcc]'
    FLASKY_MAIL_SENDER = 'ZJ Admin <14714319123@163.com>'
    FLASKY_ADMIN = '14714319123@163.com'


    @staticmethod
    def init_app(app):
        pass


class DevelopmentConfig(config):
    DEBUG = True
    SQLALCHEMY_ECHO = True
    SQLALCHEMY_DATABASE_URI = "mysql://root:ciscoccnp@127.0.0.1/hcc?charset=utf8"
    SQLALCHEMY_POOL_SIZE = 0
    SQLALCHEMY_ZABBIX_API_URL = "http://42.62.73.236/zabbix/api_jsonrpc.php"
    SQLALCHEMY_ZABBIX_API_USER = "Admin"
    SQLALCHEMY_ZABBIX_API_PASS = ""
    SQLALCHEMY_ZABBIX_API_HEADERS = {'Content-Type': 'application/json-rpc'}

class ProductionConfig(config):
    SQLALCHEMY_DATABASE_URI = "mysql://root:ciscoccnp@127.0.0.1/hcc?charset=utf8"
    SQLALCHEMY_POOL_SIZE = 0


config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig
}
