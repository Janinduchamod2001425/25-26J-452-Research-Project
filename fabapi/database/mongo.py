from pymongo import MongoClient
import os

MONGO_URL = "mongodb+srv://duvidu_user:20010905Dk-@cluster0.abr7w5e.mongodb.net/?retryWrites=true&w=majority"

client = MongoClient(MONGO_URL)

db = client["fabricvision"]

modelA_collection = db["modelA_predictions"]
defect_collection = db["defects"]