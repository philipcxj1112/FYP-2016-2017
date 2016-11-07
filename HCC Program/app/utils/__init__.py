#coding:utf-8
__author__= "songxiang"

def check_field_exists(obj,data,field_none=[]):
	"""
	验证字段是否合法
	:param data   需要验证的数据
	:param field_none 可以为空的字段
	:return:
	"""
	for field in data.keys():
		if not hasattr(obj, field):
		# 验证字段是否存在
			raise Exception("params error: {}".format(field))
		if not data.get(field,None):
		# 验证字段是否为none
			if data[field] not in field_none:
				raise Exception("{}不能为空".format(data[field]))
def process_result(data):
	black = ['_sa_instance_state']
	ret = []
	for obj in data:
		tmp = obj.__dict__
		for p in black:
			try:	
				tmp.pop(p)
			except:pass
		ret.append(tmp)
	return ret

def check_order_by(obj, order_by=''):
	order_by = order_by.split()
	if len(order_by)!=2:
		raise Exception("order_by参数不正确")
	field,order = order_by
	order_list = ["asc","desc"]
	if order.lower() not in order_list:
		raise Exception("排序参数不正确，值可以为{}".format(order_list))
	if not hasattr(obj, field):
		raise Exception("排序字段不在该表中")
def check_limit(limit):
	if not str(limit).isdigit():
		raise Exception("limit值必须为数字")

def check_output_field(obj,output=[]):
	if not isinstance(output, list):
		raise Exception('output必须是列表')

	for field in output:
		if not hasattr(obj, field):
			raise Exception("{}这个输出字段不存在".format(field))	

def check_update_params(obj,data,where):
	if not data:
		raise Exception("没有需要的")

	for field in data.keys():
		if not hasattr(obj, field):
			raise Exception("需要更新的{}字段不存在".format(field))
	if not where:
		raise Exception("需要提供where条件")

	if not where.get('id',None) :
		raise Exception("需要提供id作为条件")

	try:
		id = int(where["id"])
		if id <=0:
			raise Exception("条件id的值不能为负数")
	except ValueError:
		raise Exception("条件id的值必须为int")	

def check_value_exists(obj,name,value):
	from app.models import db
	where = {name:value}
	ret = db.session.query(obj).filter_by(**where).first()
	if not ret:
		raise Exception("{}不存在".format(value))














