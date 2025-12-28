import os
from flask import Flask, render_template, request, redirect, url_for, flash, session
import pickle
import numpy as np
import pandas as pd
from datetime import datetime

# ----------------- CONFIG -----------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")

app = Flask(
    __name__,
    static_folder=os.path.join(BASE_DIR, "static"),
    template_folder=os.path.join(BASE_DIR, "templates"),
)
app.secret_key = "super_secret_key"

# ----------------- MODEL PATHS -----------------
MODEL_PATH = os.path.join(MODELS_DIR, "model.pkl")
PROTOCOL_ENCODER = os.path.join(MODELS_DIR, "protocol_encoder.pkl")
SERVICE_ENCODER = os.path.join(MODELS_DIR, "service_encoder.pkl")
FLAG_ENCODER = os.path.join(MODELS_DIR, "flag_encoder.pkl")
ATTACK_ENCODER = os.path.join(MODELS_DIR, "attack_label_encoder.pkl")

model = protocol_enc = service_enc = flag_enc = attack_enc = None


# ----------------- LOAD ARTIFACTS -----------------
def load_artifacts():
    """Load the ML model and encoders."""
    global model, protocol_enc, service_enc, flag_enc, attack_enc

    print("\n===== LOADING ML ARTIFACTS =====")

    if os.path.exists(MODEL_PATH):
        print("✔ MODEL LOADED:", MODEL_PATH)
        with open(MODEL_PATH, "rb") as f:
            model = pickle.load(f)

    with open(PROTOCOL_ENCODER, "rb") as f:
        protocol_enc = pickle.load(f)

    with open(SERVICE_ENCODER, "rb") as f:
        service_enc = pickle.load(f)

    with open(FLAG_ENCODER, "rb") as f:
        flag_enc = pickle.load(f)

    with open(ATTACK_ENCODER, "rb") as f:
        attack_enc = pickle.load(f)


load_artifacts()

# ----------------- HELPERS -----------------
def to_int(v):
    try:
        return int(float(v))
    except:
        return 0


def to_float(v):
    try:
        return float(v)
    except:
        return 0.0


# ⭐ NEW FUNCTION — OUT OF RANGE CHECK
def is_out_of_range(v, low=0, high=100000):
    try:
        v = float(v)
        return v < low or v > high
    except:
        return True


# ----------------- FEATURE PREPARATION -----------------
def prepare_features(form):
    cols = [
        "duration", "protocol_type", "service", "flag",
        "src_bytes", "dst_bytes", "hot", "count", "srv_count",
        "same_srv_rate", "dst_host_count", "dst_host_srv_count",
        "dst_host_same_srv_rate", "dst_host_diff_srv_rate",
        "dst_host_same_src_port_rate", "dst_host_rerror_rate"
    ]

    row = {
        "duration": to_int(form.get("duration")),
        "protocol_type": form.get("protocol_type"),
        "service": form.get("service"),
        "flag": form.get("flag"),
        "src_bytes": to_int(form.get("src_bytes")),
        "dst_bytes": to_int(form.get("dst_bytes")),
        "hot": to_int(form.get("hot")),
        "count": to_int(form.get("count")),
        "srv_count": to_int(form.get("srv_count")),
        "same_srv_rate": to_float(form.get("same_srv_rate")),
        "dst_host_count": to_int(form.get("dst_host_count")),
        "dst_host_srv_count": to_int(form.get("dst_host_srv_count")),
        "dst_host_same_srv_rate": to_float(form.get("dst_host_same_srv_rate")),
        "dst_host_diff_srv_rate": to_float(form.get("dst_host_diff_srv_rate")),
        "dst_host_same_src_port_rate": to_float(form.get("dst_host_same_src_port_rate")),
        "dst_host_rerror_rate": to_float(form.get("dst_host_rerror_rate")),
    }

    df = pd.DataFrame([row], columns=cols)

    # encode categories
    df["protocol_type"] = protocol_enc.transform(df["protocol_type"])
    df["service"] = service_enc.transform(df["service"])
    df["flag"] = flag_enc.transform(df["flag"])

    return df


# ----------------- SIMPLE REGISTER & LOGIN -----------------
@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        flash("Registration successful!", "success")
        return redirect(url_for("login"))
    return render_template("register.html")


@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        flash("Login successful!", "success")
        return redirect(url_for("prediction"))
    return render_template("login.html")


# ----------------- PAGES -----------------
@app.route("/")
def home():
    return render_template("index.html")


@app.route("/reset_prediction")
def reset_prediction():
    session.pop("last_result", None)
    return redirect(url_for("prediction"))


# ----------------- PREDICTION LOGIC -----------------
@app.route("/prediction", methods=["GET", "POST"])
def prediction():

    # Show previous result if exists
    if request.method == "GET" and "last_result" in session:
        saved = session["last_result"]
        return render_template(
            "output.html",
            input_data=saved["input_data"],
            prediction_result=saved["prediction"],
            confidence=saved["confidence"],
            timestamp=saved["timestamp"],
        )

    if request.method == "POST":

        # -----------------------------
        #  STEP 1 → Check out-of-range
        # -----------------------------
        numeric_fields = [
            "duration", "src_bytes", "dst_bytes", "hot", "count",
            "srv_count", "same_srv_rate", "dst_host_count",
            "dst_host_srv_count", "dst_host_same_srv_rate",
            "dst_host_diff_srv_rate", "dst_host_same_src_port_rate",
            "dst_host_rerror_rate"
        ]

        out_of_range = any(is_out_of_range(request.form.get(f)) for f in numeric_fields)

        input_data = dict(request.form)
        timestamp = datetime.now().strftime("%d-%m-%Y %I:%M %p")

        # If any feature is outside safe range → auto ATTACK
        if out_of_range:
            session["last_result"] = {
                "input_data": input_data,
                "prediction": "attack",
                "confidence": 100,
                "timestamp": timestamp,
            }
            return render_template(
                "output.html",
                input_data=input_data,
                prediction_result="attack",
                confidence=100,
                timestamp=timestamp,
            )

        # -----------------------------
        #  STEP 2 → Normal ML Prediction
        # -----------------------------
        X = prepare_features(request.form)
        pred = model.predict(X)[0]
        attack_name = attack_enc.inverse_transform([pred])[0]

        if hasattr(model, "predict_proba"):
            confidence = int(np.max(model.predict_proba(X)) * 100)
        else:
            confidence = 90

        session["last_result"] = {
            "input_data": input_data,
            "prediction": attack_name,
            "confidence": confidence,
            "timestamp": timestamp,
        }

        return render_template(
            "output.html",
            input_data=input_data,
            prediction_result=attack_name,
            confidence=confidence,
            timestamp=timestamp,
        )

    return render_template("prediction.html")


# ----------------- RUN APP -----------------
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
