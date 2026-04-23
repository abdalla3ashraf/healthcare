# import sys
# import json
# import joblib
# import pandas as pd
# import os
# import warnings
# warnings.filterwarnings('ignore')

# BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# input_data = json.loads(sys.argv[1])

# model  = joblib.load(os.path.join(BASE_DIR, 'pulsekey_model.pkl'))
# scaler = joblib.load(os.path.join(BASE_DIR, 'scaler.pkl'))

# # الترتيب مهم جداً
# df = pd.DataFrame([{
#     'age':           input_data.get('age', 30),
#     'gender':        input_data.get('gender', 1),
#     'diabetes':      input_data.get('diabetes', 0),
#     'hypertension':  input_data.get('hypertension', 0),
#     'heart_disease': input_data.get('heart_disease', 0),
#     'glucose':       input_data.get('glucose', 90),
#     'systolic_bp':   input_data.get('systolic_bp', 120),
#     'diastolic_bp':  input_data.get('diastolic_bp', 80),
#     'heart_rate':    input_data.get('heart_rate', 75),
#     'temperature':   input_data.get('temperature', 36.5),
#     'spo2':          input_data.get('spo2', 98),
# }], columns=['age','gender','diabetes','hypertension','heart_disease','glucose','systolic_bp','diastolic_bp','heart_rate','temperature','spo2'])

# scaled_data = scaler.transform(df)
# risk_level  = int(model.predict(scaled_data)[0])

# print(json.dumps({ 'risk_level': risk_level }))

import sys
import json
import joblib
import pandas as pd

# This function will be called by the Backend team
def load_pulsekey_assets():
    try:
        model = joblib.load('pulsekey_model.pkl')
        scaler = joblib.load('scaler.pkl')
        return model, scaler
    except Exception as e:
        return f"Error: {e}"

def get_medical_advice(vitals, risk_level):
    advices = []
    if vitals.get('glucose', 0) > 140: advices.append("🟡 High Glucose: Limit carbs.")
    if vitals.get('sys_bp', 0) > 130: advices.append("🟡 High BP: Reduce salt intake.")
    if not advices: advices.append("✅ Vitals are stable.")
    return advices

def generate_pulsekey_report(input_data):
    model, scaler = load_pulsekey_assets()

    expected_columns = scaler.feature_names_in_

    df = pd.DataFrame(
        [[input_data.get(col, 0) for col in expected_columns]],
        columns=expected_columns
    )

    scaled_data = scaler.transform(df)   # 👈 لازم يكون على نفس المستوى
    risk_level = int(model.predict(scaled_data)[0])

    return {
    'risk_level': risk_level,
    'message': "High risk, please seek help",
    'advice_list': get_medical_advice(input_data, risk_level)
}

def pulsekey_chatbot_reply(user_query, session_data):
    if not session_data: return "Please enter your vitals first."
    return f"Status: {session_data['risk_level']}. Follow the advice in your report."
if __name__ == "__main__":
    print(json.dumps({
        "risk_level": 2,
        "debug": "working"
    }))

# import joblib
# import pandas as pd

# # This function will be called by the Backend team
# def load_pulsekey_assets():
#     try:
#         model = joblib.load('pulsekey_model.pkl')
#         scaler = joblib.load('scaler.pkl')
#         return model, scaler
#     except Exception as e:
#         return f"Error: {e}"

# def get_medical_advice(vitals, risk_level):
#     advices = []
#     if vitals.get('glucose', 0) > 140: advices.append("🟡 High Glucose: Limit carbs.")
#     if vitals.get('sys_bp', 0) > 130: advices.append("🟡 High BP: Reduce salt intake.")
#     if not advices: advices.append("✅ Vitals are stable.")
#     return advices

# def generate_pulsekey_report(input_data):
#     # This will be used by the backend developer
#     model, scaler = load_pulsekey_assets()
#     df = pd.DataFrame([input_data])
#     scaled_data = scaler.transform(df)
#     risk_level = int(model.predict(scaled_data)[0])
#     return {
#         'risk_level': risk_level,
#         'advice_list': get_medical_advice(input_data, risk_level)
#     }

# def pulsekey_chatbot_reply(user_query, session_data):
#     if not session_data: return "Please enter your vitals first."
#     return f"Status: {session_data['risk_level']}. Follow the advice in your report."
