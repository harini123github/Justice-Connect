from flask import Flask, request, jsonify, session,send_from_directory
from flask_cors import CORS
from flask_bcrypt import Bcrypt
import sqlite3
from solcx import compile_standard, install_solc
from web3 import Web3
import os
from werkzeug.utils import secure_filename
from datetime import date
import numpy as np
app = Flask(__name__)
app.secret_key = "supersecretkey"   # change this in production
CORS(app, supports_credentials=True)
bcrypt = Bcrypt(app)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
# === Blockchain Setup ===
ganache_url = "http://127.0.0.1:7545"
web3 = Web3(Web3.HTTPProvider(ganache_url))
# --------------------------
# Hardcoded Ganache account
# --------------------------
private_key = "0x514ec658db4b08971a9c07415c36c01be54147007bbf01f16126568d0bd1281d"
account_address = "0xAd800dd534b508D86c2Ce955675c1720acE60A5D"

# --------------------------
# Contract details (from Ganache deployment)
# --------------------------
contract_address = "0x8d39dC52CFDe13A322dcBed234c8AdE6aE3D088C"
contract_abi = [
    {
        "inputs": [{"internalType": "string", "name": "_ipfsHash", "type": "string"}],
        "name": "storeJudgement",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function",
    }
]

# --------------------------
# Upload file to local IPFS
# --------------------------
def upload_to_ipfs(filepath):
    with open(filepath, 'rb') as f:
        response = requests.post("http://127.0.0.1:5001/api/v0/add", files={"file": f})
    if response.status_code == 200:
        return response.json()["Hash"]
    else:
        raise Exception(f"IPFS Upload Failed: {response.text}")

# --------------------------
# Connect Web3 to Ganache
# --------------------------
w3 = Web3(Web3.HTTPProvider("http://127.0.0.1:7545"))  # Ganache RPC
if not w3.is_connected():
    raise Exception("Web3 not connected to Ganache")

# --------------------------
# Load Contract
# --------------------------
contract = w3.eth.contract(address=contract_address, abi=contract_abi)
import requests
os.makedirs("static", exist_ok=True)
# --- Function: Upload file to IPFS ---
 

# --- Function: Store hash on Blockchain ---
def store_on_blockchain(cid):
    nonce = w3.eth.get_transaction_count(account_address)

    tx = {
        'nonce': nonce,
        'to': account_address,   # simple self transaction to record hash
        'value': 0,
        'gas': 2000000,
        'gasPrice': web3.to_wei('50', 'gwei'),
        'data': web3.to_hex(text=cid)   # store IPFS CID as tx data
    }

    signed_tx = web3.eth.account.sign_transaction(tx, private_key)
    tx_hash = web3.eth.send_raw_transaction(signed_tx.raw_transaction)
    return web3.to_hex(tx_hash)

# --- DB Helper ---
def get_db():
    conn = sqlite3.connect("judge.db")
    conn.row_factory = sqlite3.Row
    return conn
def soliditycontract(e, file_name):
    import json
    install_solc("0.6.0")
    with open("./SimpleStorage.sol", "r") as file:
        simple_storage_file = file.read()
    print(simple_storage_file)
    compiled_sol = compile_standard(
        {
            "language": "Solidity",
            "sources": {"SimpleStorage.sol": {"content": simple_storage_file}},
            "settings": {
                "outputSelection": {
                    "*": {
                        "*": ["abi", "metadata", "evm.bytecode", "evm.bytecode.sourceMap"]
                    }
                }
            },
        },
        solc_version="0.6.0",
    )
    with open("compiled_code.json", "w") as file:
        json.dump(compiled_sol, file)
    bytecode = compiled_sol["contracts"]["SimpleStorage.sol"]["SimpleStorage"]["evm"][
        "bytecode"
    ]["object"]
    # get abi
    abi = json.loads(
        compiled_sol["contracts"]["SimpleStorage.sol"]["SimpleStorage"]["metadata"]
    )["output"]["abi"]
    w3 = Web3(Web3.HTTPProvider('HTTP://127.0.0.1:7545'))
    chain_id = 1337
    print(w3.is_connected())
    my_address = e[0]
    private_key = e[1]
    # initialize contract
    SimpleStorage = w3.eth.contract(abi=abi, bytecode=bytecode)
    nonce = w3.eth.get_transaction_count(my_address)
    # set up transaction from constructor which executes when firstly
    transaction = SimpleStorage.constructor(file_name).build_transaction(
        {"chainId": chain_id, "from": my_address, "nonce": nonce}
    )
    signed_tx = w3.eth.account.sign_transaction(
        transaction, private_key=private_key)
    tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
    tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    tx_receipt = "".join(["{:02X}".format(b)
                         for b in tx_receipt["transactionHash"]])
    return tx_receipt

# --- Register ---
@app.route("/register", methods=["POST"])
def register():
    data = request.json
    print(data)
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")
    address = data.get("address")
    phone = data.get("phone")
    privatekey = data.get("privatekey")
    role = data.get("role")
    experience= data.get("experience")
    conn = get_db()
    try:
        conn = get_db()
        cur = conn.cursor()
        cur.execute("select ifnull(max(id), 0) from users")
        max_id = cur.fetchone()[0]
        cur.execute("INSERT INTO users (id, username, email, password, address, phone, privatekey, role,experience) VALUES (?, ?, ?, ?, ?, ?, ?, ?,?)",
                    (max_id + 1, username, email, password, address, phone, privatekey, role,experience))

        soliditycontract([address, privatekey], username)
        conn.commit()
        conn.close()
        return jsonify({"message": "User registered successfully"}), 201
    except sqlite3.IntegrityError as e:
        print(e)
        return jsonify({"error": str(e)}), 400
    finally:
        if conn:
            conn.close()

# --- Login ---
@app.route("/login", methods=["POST"])
def login():
    data = request.json
    print(data)
    if data["role"]=="admin":
        print("admin login")
        print((data.get("address"), data.get("private_key"),data.get("role")))
        conn = get_db()
        cur = conn.cursor()
        cur.execute("SELECT * FROM users WHERE email=? and password=? and role=?", (data.get("address"), data.get("private_key"),data.get("role")))
        user = cur.fetchone()
        conn.close()
        print(user)

        if not user:
            return jsonify({"error": "Address not registered"}), 401
        else:
            session["user_id"] = user["id"]
            session["address"] = user["address"]
            session["username"] = user["username"]
            return jsonify({"message": "Login successful", "address": user["address"], "id": user["id"], "role": user["role"], "username": user["username"]}), 200
    else:
        address = data.get("address")
        private_key = data.get("private_key")
        role = data.get("role")

        conn = get_db()
        cur = conn.cursor()
        cur.execute("SELECT * FROM users WHERE address=? and role=?", (address,role))
        user = cur.fetchone()
        conn.close()

        if not user:
            return jsonify({"error": "Address not registered"}), 401

        # Verify private key (dummy example — replace with actual crypto verification)
        stored_private_key = user["privatekey"]  
        if stored_private_key == private_key:
            session["user_id"] = user["id"]
            session["address"] = user["address"]
            session["username"] = user["username"]
            session["role"] = user["role"]
            return jsonify({"message": "Login successful", "address": user["address"], "id": user["id"], "role": user["role"], "approved": user["approved"], "username": user["username"]}), 200

        return jsonify({"error": "Invalid credentials"}), 401

# --- Check Session ---
@app.route("/me", methods=["GET"])
def me():
    if "user_id" in session:
        return jsonify({"logged_in": True, "username": session["username"], "role": session["role"]})
    return jsonify({"logged_in": False})

# --- Logout ---
@app.route("/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"message": "Logged out"}), 200


# === Upload Endpoint ===

@app.route('/upload-judgement', methods=['POST'])
def upload_judgement():
    try:
        # Ensure logged in
        print(session)
        # Get inputs
        judgement_title = request.form['judgementtitle']
        file = request.files['file']
        print(file)
        print("came here")
        filepath = os.path.join("static", file.filename)
        file.save(filepath)
        print("File saved to:", filepath)
        # Upload to IPFS
        cid = upload_to_ipfs(filepath)
        print(cid)

        # Store CID on blockchain
        tx_hash = store_on_blockchain(cid)

        # Save in DB
        conn = get_db()
        cur = conn.cursor()
        cur.execute("select ifnull(max(id), 0) from judgements")
        max_id = cur.fetchone()[0]
        cur.execute(
            "INSERT INTO judgements (id, user_id, judgementtitle, pdfdetails, ipfskey, blockchainkey) VALUES (?, ?, ?, ?, ?, ?)",
            (max_id + 1, request.form['userid'], judgement_title, file.filename, cid, tx_hash)
        )
        conn.commit()
        conn.close()

        return jsonify({
            "status": "success",
            "judgementtitle": judgement_title,
            "pdfdetails": file.filename,
            "ipfskey": cid,
            "blockchain_tx": tx_hash
        })

    except Exception as e:
        print("Upload error:", e)
        return jsonify({"status": "error", "message": str(e)}), 500
@app.route("/api/judgements", methods=["GET"])
def get_judgements():
    conn = get_db()
    rows = conn.execute("SELECT * FROM judgements").fetchall()
    conn.close()
    data = [dict(r) for r in rows]
    return jsonify(data)

@app.route("/admin/users", methods=["GET"])
def view_users():
    conn = get_db()
    cur = conn.cursor()
    cur.execute("""
        SELECT id, username, email, role, approved, created_at
        FROM users
    """)
    users = cur.fetchall()
    conn.close()

    return jsonify([dict(u) for u in users])

@app.route("/admin/approve/<int:user_id>", methods=["POST"])
def approve_user(user_id):
    conn = get_db()
    cur = conn.cursor()

    cur.execute(
        "UPDATE users SET approved = 1 WHERE id = ?",
        (user_id,)
    )
    conn.commit()
    conn.close()

    return jsonify({"message": "User approved successfully"})

@app.route("/admin/reject/<int:user_id>", methods=["POST"])
def reject_user(user_id):
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        "UPDATE users SET approved = 0 WHERE id = ?",
        (user_id,)
    )
    conn.commit()
    conn.close()

    return jsonify({"message": "User rejected"})
@app.route("/users", methods=["GET"])
def get_users():
    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
        SELECT id, username, role,email
        FROM users
        WHERE approved = 1
    """)
    users = cur.fetchall()
    conn.close()

    return jsonify([dict(u) for u in users])

import PyPDF2
from transformers import pipeline
from sentence_transformers import SentenceTransformer, util
import joblib
import pandas as pd



summarizer = pipeline("summarization", model="facebook/bart-large-cnn")

# ---------------- HELPER: PDF TEXT ----------------
def extract_text(pdf_path):
    text = ""
    with open(pdf_path, "rb") as file:
        reader = PyPDF2.PdfReader(file)
        for page in reader.pages:
            t = page.extract_text()
            if t:
                text += t + "\n"
    return text


# ---------------- HELPER: SPLIT ----------------
def split_text(text, max_chunk=500):
    sentences = text.split(". ")
    chunks, chunk = [], ""

    for s in sentences:
        if len(chunk) + len(s) <= max_chunk:
            chunk += s + ". "
        else:
            chunks.append(chunk)
            chunk = s + ". "

    if chunk:
        chunks.append(chunk)

    return chunks


# ---------------- HELPER: SUMMARIZE ----------------
def summarize_text(text):
    chunks = split_text(text)
    summary_list = []

    for chunk in chunks:
        summary = summarizer(chunk, max_length=80, min_length=25, do_sample=False)
        summary_list.append(summary[0]["summary_text"])

    return " ".join(summary_list)
import smtplib
from email.message import EmailMessage


def send_email(receiver_email, subject, message):
    try:
        sender_email = "deepadharshinir05@gmail.com"
        app_password = "zvahnruwxbgtbgxs"  # ⚠️ move to env in production

        # Create email
        msg = EmailMessage()
        msg["Subject"] = subject
        msg["From"] = sender_email
        msg["To"] = receiver_email

        msg.set_content(message)

        # Send email
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(sender_email, app_password)
            server.send_message(msg)

        print("✅ Email sent successfully")
        return True

    except Exception as e:
        print("❌ Email Error:", e)
        return False

# ---------------- MAIN API ----------------
@app.route("/cases", methods=["POST"])
def add_case():
    userid = request.form.get("userid")
    judgeid = request.form.get("judgeid")
    lawyerid = request.form.get("lawyerid")  # ✅ NEW
    otheruser = request.form.get("otheruser")

    casesubject = request.form.get("casesubject")

    # ML fields
    case_type = request.form.get("case_type")
    case_complexity = int(request.form.get("case_complexity") or 0)
    num_witnesses = int(request.form.get("num_witnesses") or 0)
    num_evidence_docs = int(request.form.get("num_evidence_docs") or 0)
    court_level = request.form.get("court_level")
    previous_adjournments = int(request.form.get("previous_adjournments") or 0)

    # ---------------- FILE UPLOAD ----------------
    pdf = request.files.get("contentpdf")
    pdf_path = None
    summary = ""

    if pdf:
        filename = secure_filename(pdf.filename)
        pdf_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        pdf.save(pdf_path)

        # 🔥 Extract + Summarize
        text = extract_text(pdf_path)
        if text.strip():
            summary = summarize_text(text)

    # ---------------- GET LAWYER EXPERIENCE ----------------
    conn = get_db()
    cur = conn.cursor()

    cur.execute("SELECT experience FROM users WHERE id = ?", (lawyerid,))
    result = cur.fetchone()
    lawyer_exp = result[0] if result else 0

    # ---------------- ML PREDICTION ----------------
    new_case = {
        "case_type": case_type,
        "case_complexity": case_complexity,
        "num_witnesses": num_witnesses,
        "num_evidence_docs": num_evidence_docs,
        "lawyer_experience": lawyer_exp,
        "court_level": court_level,
        "previous_adjournments": previous_adjournments
    }
    # ---------------- LOAD MODELS ----------------
    model1 = joblib.load("hearing_model.pkl")
    le_case = joblib.load("case_encoder.pkl")
    le_court = joblib.load("court_encoder.pkl")
    # encode
    new_case["case_type"] = le_case.transform([new_case["case_type"]])[0]
    new_case["court_level"] = le_court.transform([new_case["court_level"]])[0]

    df = pd.DataFrame([new_case])
    prediction = int(round(model1.predict(df)[0]))

    # ---------------- INSERT INTO DB ----------------
    cur.execute("""
        INSERT INTO cases (
            userid, judgeid, lawyerid, otheruser,
            casesubject, contentpdf,
            contentsummarise,
            case_type, case_complexity, num_witnesses,
            num_evidence_docs, court_level,
            previous_adjournments, predicted_hearings
        ) VALUES (?, ?, ?, ?, ?,  ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        userid,
        judgeid,
        lawyerid,
        otheruser,
        casesubject,
        pdf_path,
        summary,
        case_type,
        case_complexity,
        num_witnesses,
        num_evidence_docs,
        court_level,
        previous_adjournments,
        prediction
    ))

    # ---------------- GET EMAILS ----------------
    cur = conn.cursor()

    cur.execute("SELECT email, username FROM users WHERE id = ?", (userid,))
    user_data = cur.fetchone()

    cur.execute("SELECT email, username FROM users WHERE id = ?", (otheruser,))
    other_data = cur.fetchone()

    cur.execute("SELECT email, username FROM users WHERE id = ?", (lawyerid,))
    lawyer_data = cur.fetchone()

    # ---------------- EMAIL CONTENT ----------------
    subject = "⚖ New Case Registered"

    def build_message(name):
        return f"""
    Hello {name},

    A new case has been registered.

    📌 Subject: {casesubject}
    📊 Predicted Hearings: {prediction}

    🧠 Summary:
    {summary if summary else "Not available"}

    Please login to view full details.

    Regards,
    Legal System
    """

    # ---------------- SEND EMAILS ----------------
    if user_data:
        send_email(user_data[0], subject, build_message(user_data[1]))

    if other_data:
        send_email(other_data[0], subject, build_message(other_data[1]))

    if lawyer_data:
        send_email(lawyer_data[0], subject, build_message(lawyer_data[1]))
    conn.commit()
    conn.close()
 
    return jsonify({
        "message": "Case added successfully",
        "predicted_hearings": prediction,
        "summary": summary
    })
@app.route("/cases", methods=["GET"])
def cases_list():
    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
        SELECT 
            c.caseid,
            c.casesubject,
            c.status,

            -- 👤 Users
            u.username AS user,
            j.username AS judge,
            l.username AS lawyer,        -- ✅ NEW
            o.username AS otherusername,

            -- IDs
            c.userid,
            c.judgeid,
            c.lawyerid,
            c.otheruser,

            -- 🤖 AI + ML fields
            c.contentsummarise,          -- ✅ summary
            c.predicted_hearings,         -- ✅ prediction
            c.case_type
        FROM cases c

        LEFT JOIN users u ON c.userid = u.id
        LEFT JOIN users j ON c.judgeid = j.id
        LEFT JOIN users l ON c.lawyerid = l.id   -- ✅ NEW JOIN
        LEFT JOIN users o ON c.otheruser = o.id

        ORDER BY c.caseid DESC
    """)

    rows = cur.fetchall()
    conn.close()

    return jsonify([dict(r) for r in rows])

model = SentenceTransformer('all-MiniLM-L6-v2')

@app.route("/cases/<int:caseid>/similar", methods=["GET"])
def similar_cases(caseid):
    conn = get_db()
    cur = conn.cursor()

    # ✅ Get target case
    cur.execute("""
        SELECT caseid, casesubject, contentsummarise, judgementsummarise
        FROM cases
        WHERE caseid = ?
    """, (caseid,))
    
    target = cur.fetchone()
    if not target:
        return jsonify([])

    # ✅ Combine text (NO casecontent)
    target_text = " ".join([
        target["casesubject"] or "",
        target["contentsummarise"] or "",
        target["judgementsummarise"] or ""
    ])

    # ✅ Get all other cases
    cur.execute("""
        SELECT caseid, casesubject, contentsummarise, judgementsummarise, status
        FROM cases
        WHERE caseid != ?
    """, (caseid,))
    
    cases = cur.fetchall()
    conn.close()

    if not cases:
        return jsonify([])

    # ✅ Prepare corpus
    corpus_texts = []
    case_ids = []

    for c in cases:
        text = " ".join([
            c["casesubject"] or "",
            c["contentsummarise"] or "",
            c["judgementsummarise"] or ""
        ])
        corpus_texts.append(text)
        case_ids.append(c["caseid"])

    # ✅ Encode using transformer
    target_embedding = model.encode(target_text, convert_to_tensor=True)
    corpus_embeddings = model.encode(corpus_texts, convert_to_tensor=True)

    # ✅ Compute similarity
    similarities = util.cos_sim(target_embedding, corpus_embeddings)[0]

    # ✅ Get top 5 similar
    top_results = np.argsort(-similarities.cpu().numpy())[:5]

    similar_cases = []
    for idx in top_results:
        case_data = cases[idx]
        score = float(similarities[idx])

        similar_cases.append({
            "caseid": case_data["caseid"],
            "casesubject": case_data["casesubject"],
            "contentsummarise": case_data["contentsummarise"],
            "judgementsummarise": case_data["judgementsummarise"],
            "status": case_data["status"],
            "similarity_score": round(score, 3)
        })

    return jsonify(similar_cases)



@app.route("/case/<int:caseid>", methods=["GET"])
def view_case(caseid):
    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
        SELECT 
            c.*,

            u.username AS user,
            j.username AS judge,
            l.username AS lawyer,
            o.username AS otherusername,

            l.experience AS lawyer_experience,

            -- 🔥 AI + FILE FIELDS
            c.contentsummarise,
            c.judgementsummarise,
            c.predicted_hearings,
            c.judgementpdf

        FROM cases c

        LEFT JOIN users u ON c.userid = u.id
        LEFT JOIN users j ON c.judgeid = j.id
        LEFT JOIN users l ON c.lawyerid = l.id
        LEFT JOIN users o ON c.otheruser = o.id

        WHERE c.caseid = ?
    """, (caseid,))

    case = cur.fetchone()

    if not case:
        return jsonify({"error": "Case not found"}), 404

    # 📅 Hearings
    cur.execute("""
        SELECT * FROM casehearing
        WHERE caseid = ?
        ORDER BY casedate ASC
    """, (caseid,))

    hearings = cur.fetchall()

    conn.close()

    case_dict = dict(case)

    return jsonify({
        "case": case_dict,
        "hearings": [dict(h) for h in hearings],

        # 🔥 Clean AI + FILE response
        "ai": {
            "case_summary": case_dict.get("contentsummarise"),
            "judgement_summary": case_dict.get("judgementsummarise"),
            "predicted_hearings": case_dict.get("predicted_hearings"),
            "judgement_pdf": case_dict.get("judgementpdf")   # ✅ NEW
        }
    })


@app.route("/case/hearing", methods=["POST"])
def add_hearing():
    data = request.json

    conn = get_db()
    cur = conn.cursor()

    # ---------------- INSERT HEARING ----------------
    cur.execute("""
        INSERT INTO casehearing (caseid, casedate, caseinfo, nexthearingdate)
        VALUES (?, ?, ?, ?)
    """, (
        data["caseid"],
        data["casedate"],
        data["caseinfo"],
        data.get("nexthearingdate")
    ))

    # ---------------- OPTIONAL STATUS UPDATE ----------------
    cur.execute(
        "UPDATE cases SET status='HEARING' WHERE caseid=?",
        (data["caseid"],)
    )

    conn.commit()

    # ---------------- GET CASE + USERS ----------------
    cur.execute("""
        SELECT c.casesubject,
               u.email, u.username,
               o.email, o.username,
               l.email, l.username
        FROM cases c
        LEFT JOIN users u ON c.userid = u.id
        LEFT JOIN users o ON c.otheruser = o.id
        LEFT JOIN users l ON c.lawyerid = l.id
        WHERE c.caseid = ?
    """, (data["caseid"],))

    row = cur.fetchone()

    conn.close()

    # ---------------- EMAIL ----------------
    if row:
        subject = "📅 New Hearing Scheduled"

        def build_msg(name):
            return f"""
Hello {name},

A new hearing has been scheduled for your case.

📌 Case: {row["casesubject"]}
📅 Hearing Date: {data["casedate"]}
📝 Details: {data["caseinfo"]}

📆 Next Hearing: {data.get("nexthearingdate") or "Not specified"}

Please login to view more details.

Regards,
Legal System
"""

        # send to user
        if row["email"]:
            send_email(row["email"], subject, build_msg(row["username"]))

        # send to opponent
        if row[2]:  # opponent email
            send_email(row[2], subject, build_msg(row[3]))

        # send to lawyer
        if row[4]:
            send_email(row[4], subject, build_msg(row[5]))

    return jsonify({"message": "Hearing added & notifications sent"})


@app.route("/case/close", methods=["POST"])
def close_case():
    caseid = request.form.get("caseid")
    summary = request.form.get("summary")
    pdf = request.files.get("judgementpdf")

    pdf_path = None
    auto_summary = ""

    # ---------------- SAVE PDF ----------------
    if pdf:
        filename = secure_filename(pdf.filename)
        pdf_path = os.path.join("uploads", filename)
        pdf.save(pdf_path)

        # 🔥 AUTO SUMMARY
        if not summary:
            text = extract_text(pdf_path)
            if text.strip():
                auto_summary = summarize_text(text)

    final_summary = summary if summary else auto_summary

    # ---------------- DB UPDATE ----------------
    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
        UPDATE cases
        SET 
            judgementpdf = ?,
            judgementsummarise = ?,
            status = 'CLOSED'
        WHERE caseid = ?
    """, (pdf_path, final_summary, caseid))

    conn.commit()

    # ---------------- FETCH USERS ----------------
    cur.execute("""
        SELECT 
            c.casesubject,

            u.email AS user_email, u.username AS user_name,
            o.email AS opp_email, o.username AS opp_name,
            l.email AS law_email, l.username AS law_name

        FROM cases c
        LEFT JOIN users u ON c.userid = u.id
        LEFT JOIN users o ON c.otheruser = o.id
        LEFT JOIN users l ON c.lawyerid = l.id

        WHERE c.caseid = ?
    """, (caseid,))

    row = cur.fetchone()
    conn.close()

    # ---------------- SEND EMAIL ----------------
    if row:
        subject = "⚖ Case Closed – Judgement Issued"

        def build_msg(name):
            return f"""
Hello {name},

Your case has been successfully CLOSED.

📌 Case: {row["casesubject"]}

🧠 Judgement Summary:
{final_summary if final_summary else "Not available"}

📄 Judgement PDF:
Download from system.

Please login to view complete details.

Regards,
Legal System
"""

        # 👤 user
        if row["user_email"]:
            send_email(row["user_email"], subject, build_msg(row["user_name"]))

        # 🆚 opponent
        if row["opp_email"]:
            send_email(row["opp_email"], subject, build_msg(row["opp_name"]))

        # 👨‍💼 lawyer
        if row["law_email"]:
            send_email(row["law_email"], subject, build_msg(row["law_name"]))

    return jsonify({
        "message": "Case closed & notifications sent",
        "summary": final_summary
    })

from datetime import date

@app.route("/dashboard/stats", methods=["GET"])
def dashboard_stats():

    user_id = request.args.get("user_id")
    
    today = date.today().isoformat()
    year = date.today().year

    conn = get_db()
    cur = conn.cursor()

    # 👉 detect role
    role = None
    if user_id:
        cur.execute("SELECT role FROM users WHERE id=?", (user_id,))
        r = cur.fetchone()
        if r:
            role = r[0]
    print(role)
    # =========================
    # ADMIN (global)
    # =========================
    if  role == "admin":
        cur.execute("SELECT COUNT(*) FROM cases")
        total_cases = cur.fetchone()[0]

        cur.execute("SELECT COUNT(*) FROM cases WHERE status='OPEN'")
        open_cases = cur.fetchone()[0]

        cur.execute("SELECT COUNT(*) FROM cases WHERE status='CLOSED'")
        closed_cases = cur.fetchone()[0]

        cur.execute("SELECT COUNT(*) FROM casehearing WHERE casedate > ?", (today,))
        upcoming_hearings = cur.fetchone()[0]

        cur.execute("SELECT COUNT(*) FROM casehearing WHERE casedate = ?", (today,))
        today_hearings = cur.fetchone()[0]

        cur.execute("SELECT COUNT(*) FROM casehearing WHERE strftime('%Y', casedate)=?", (str(year),))
        year_hearings = cur.fetchone()[0]
        print(total_cases, open_cases, closed_cases, upcoming_hearings, today_hearings, year_hearings)

    # =========================
    # USER dashboard
    # =========================
    elif role == "User":

        cur.execute("SELECT COUNT(*) FROM cases WHERE userid=? or otheruser=?", (user_id,user_id))
        total_cases = cur.fetchone()[0]

        cur.execute("SELECT COUNT(*) FROM cases WHERE (userid=? or otheruser=?) AND status='OPEN'", (user_id,user_id))
        open_cases = cur.fetchone()[0]

        cur.execute("SELECT COUNT(*) FROM cases WHERE (userid=? or otheruser=?) AND status='CLOSED'", (user_id,user_id))
        closed_cases = cur.fetchone()[0]

        cur.execute("""
            SELECT COUNT(*) FROM casehearing ch
            JOIN cases c ON c.caseid = ch.caseid
            WHERE (userid=? or otheruser=?) AND ch.casedate > ?
        """, (user_id,user_id, today))
        upcoming_hearings = cur.fetchone()[0]

        cur.execute("""
            SELECT COUNT(*) FROM casehearing ch
            JOIN cases c ON c.caseid = ch.caseid
            WHERE (userid=? or otheruser=?) AND ch.casedate = ?
        """, (user_id,user_id, today))
        today_hearings = cur.fetchone()[0]

        cur.execute("""
            SELECT COUNT(*) FROM casehearing ch
            JOIN cases c ON c.caseid = ch.caseid
            WHERE (userid=? or otheruser=?) AND strftime('%Y', ch.casedate)=?
        """, (user_id,user_id, str(year)))
        year_hearings = cur.fetchone()[0]

    # =========================
    # JUDGE dashboard
    # =========================
    elif role == "Judge":

        cur.execute("SELECT COUNT(*) FROM cases WHERE judgeid=?", (user_id,))
        total_cases = cur.fetchone()[0]

        cur.execute("SELECT COUNT(*) FROM cases WHERE judgeid=? AND status='OPEN'", (user_id,))
        open_cases = cur.fetchone()[0]

        cur.execute("SELECT COUNT(*) FROM cases WHERE judgeid=? AND status='CLOSED'", (user_id,))
        closed_cases = cur.fetchone()[0]

        cur.execute("""
            SELECT COUNT(*) FROM casehearing ch
            JOIN cases c ON c.caseid = ch.caseid
            WHERE c.judgeid=? AND ch.casedate > ?
        """, (user_id, today))
        upcoming_hearings = cur.fetchone()[0]

        cur.execute("""
            SELECT COUNT(*) FROM casehearing ch
            JOIN cases c ON c.caseid = ch.caseid
            WHERE c.judgeid=? AND ch.casedate = ?
        """, (user_id, today))
        today_hearings = cur.fetchone()[0]

        cur.execute("""
            SELECT COUNT(*) FROM casehearing ch
            JOIN cases c ON c.caseid = ch.caseid
            WHERE c.judgeid=? AND strftime('%Y', ch.casedate)=?
        """, (user_id, str(year)))
        year_hearings = cur.fetchone()[0]
    # =========================
    # JUDGE dashboard
    # =========================
    elif role == "Lawyer":

        cur.execute("SELECT COUNT(*) FROM cases WHERE lawyerid=?", (user_id,))
        total_cases = cur.fetchone()[0]

        cur.execute("SELECT COUNT(*) FROM cases WHERE lawyerid=? AND status='OPEN'", (user_id,))
        open_cases = cur.fetchone()[0]

        cur.execute("SELECT COUNT(*) FROM cases WHERE lawyerid=? AND status='CLOSED'", (user_id,))
        closed_cases = cur.fetchone()[0]

        cur.execute("""
            SELECT COUNT(*) FROM casehearing ch
            JOIN cases c ON c.caseid = ch.caseid
            WHERE c.lawyerid=? AND ch.casedate > ?
        """, (user_id, today))
        upcoming_hearings = cur.fetchone()[0]

        cur.execute("""
            SELECT COUNT(*) FROM casehearing ch
            JOIN cases c ON c.caseid = ch.caseid
            WHERE c.lawyerid=? AND ch.casedate = ?
        """, (user_id, today))
        today_hearings = cur.fetchone()[0]

        cur.execute("""
            SELECT COUNT(*) FROM casehearing ch
            JOIN cases c ON c.caseid = ch.caseid
            WHERE c.lawyerid=? AND strftime('%Y', ch.casedate)=?
        """, (user_id, str(year)))
        year_hearings = cur.fetchone()[0]

    # common
    cur.execute("SELECT COUNT(*) FROM users WHERE role='User'")
    total_users = cur.fetchone()[0]

    cur.execute("SELECT COUNT(*) FROM users WHERE role='Judge'")
    total_judges = cur.fetchone()[0]

    conn.close()

    return jsonify({
        "total_cases": total_cases,
        "open_cases": open_cases,
        "closed_cases": closed_cases,
        "upcoming_hearings": upcoming_hearings,
        "today_hearings": today_hearings,
        "year_hearings": year_hearings,
        "total_users": total_users,
        "total_judges": total_judges
    })
@app.route("/uploads/<path:filename>")
def serve_pdf(filename):
    return send_from_directory("uploads", filename)


@app.route("/dashboard/list")
def dashboard_list():
    from datetime import date
    type_ = request.args.get("type")
    user_id = request.args.get("user_id")

    today = date.today().isoformat()
    year = str(date.today().year)

    conn = get_db()
    cur = conn.cursor()

    # ================= GET ROLE =================
    role = None
    if user_id:
        cur.execute("SELECT role FROM users WHERE id=?", (user_id,))
        r = cur.fetchone()
        if r:
            role = r["role"] if isinstance(r, dict) else r[0]

    # ================= ADMIN =================
    if role == "admin":

        if type_ == "total_cases":
            cur.execute("SELECT caseid, casesubject, status FROM cases")

        elif type_ == "open_cases":
            cur.execute("SELECT caseid, casesubject, status FROM cases WHERE status='OPEN'")

        elif type_ == "closed_cases":
            cur.execute("SELECT caseid, casesubject, status FROM cases WHERE status='CLOSED'")

        elif type_ == "upcoming_hearings":
            cur.execute("""
                SELECT ch.caseid, c.casesubject, ch.casedate as status
                FROM casehearing ch
                JOIN cases c ON c.caseid = ch.caseid
                WHERE ch.casedate > ?
            """, (today,))

        elif type_ == "today_hearings":
            cur.execute("""
                SELECT ch.caseid, c.casesubject, ch.casedate as status
                FROM casehearing ch
                JOIN cases c ON c.caseid = ch.caseid
                WHERE ch.casedate = ?
            """, (today,))

        elif type_ == "year_hearings":
            cur.execute("""
                SELECT ch.caseid, c.casesubject, ch.casedate as status
                FROM casehearing ch
                JOIN cases c ON c.caseid = ch.caseid
                WHERE strftime('%Y', ch.casedate)=?
            """, (year,))

        elif type_ == "users":
            cur.execute("SELECT id, username, role FROM users WHERE role='User'")

        elif type_ == "judges":
            cur.execute("SELECT id, username, role FROM users WHERE role='Judge'")

        else:
            return jsonify([])

    # ================= USER =================
    elif role == "User":

        if type_ == "total_cases":
            cur.execute("SELECT caseid, casesubject, status FROM cases WHERE userid=?", (user_id,))

        elif type_ == "open_cases":
            cur.execute("SELECT caseid, casesubject, status FROM cases WHERE userid=? AND status='OPEN'", (user_id,))

        elif type_ == "closed_cases":
            cur.execute("SELECT caseid, casesubject, status FROM cases WHERE userid=? AND status='CLOSED'", (user_id,))

        elif type_ == "upcoming_hearings":
            cur.execute("""
                SELECT ch.caseid, c.casesubject, ch.casedate as status
                FROM casehearing ch
                JOIN cases c ON c.caseid = ch.caseid
                WHERE c.userid=? AND ch.casedate > ?
            """, (user_id, today))

        elif type_ == "today_hearings":
            cur.execute("""
                SELECT ch.caseid, c.casesubject, ch.casedate as status
                FROM casehearing ch
                JOIN cases c ON c.caseid = ch.caseid
                WHERE c.userid=? AND ch.casedate = ?
            """, (user_id, today))

        elif type_ == "year_hearings":
            cur.execute("""
                SELECT ch.caseid, c.casesubject, ch.casedate as status
                FROM casehearing ch
                JOIN cases c ON c.caseid = ch.caseid
                WHERE c.userid=? AND strftime('%Y', ch.casedate)=?
            """, (user_id, year))

        else:
            return jsonify([])

    # ================= JUDGE =================
    elif role == "Judge":

        if type_ == "total_cases":
            cur.execute("SELECT caseid, casesubject, status FROM cases WHERE judgeid=?", (user_id,))

        elif type_ == "open_cases":
            cur.execute("SELECT caseid, casesubject, status FROM cases WHERE judgeid=? AND status='OPEN'", (user_id,))

        elif type_ == "closed_cases":
            cur.execute("SELECT caseid, casesubject, status FROM cases WHERE judgeid=? AND status='CLOSED'", (user_id,))

        elif type_ == "upcoming_hearings":
            cur.execute("""
                SELECT ch.caseid, c.casesubject, ch.casedate as status
                FROM casehearing ch
                JOIN cases c ON c.caseid = ch.caseid
                WHERE c.judgeid=? AND ch.casedate > ?
            """, (user_id, today))

        elif type_ == "today_hearings":
            cur.execute("""
                SELECT ch.caseid, c.casesubject, ch.casedate as status
                FROM casehearing ch
                JOIN cases c ON c.caseid = ch.caseid
                WHERE c.judgeid=? AND ch.casedate = ?
            """, (user_id, today))

        elif type_ == "year_hearings":
            cur.execute("""
                SELECT ch.caseid, c.casesubject, ch.casedate as status
                FROM casehearing ch
                JOIN cases c ON c.caseid = ch.caseid
                WHERE c.judgeid=? AND strftime('%Y', ch.casedate)=?
            """, (user_id, year))

        else:
            return jsonify([])
    # ================= JUDGE =================
    elif role == "Lawyer":

        if type_ == "total_cases":
            cur.execute("SELECT caseid, casesubject, status FROM cases WHERE lawyerid=?", (user_id,))

        elif type_ == "open_cases":
            cur.execute("SELECT caseid, casesubject, status FROM cases WHERE lawyerid=? AND status='OPEN'", (user_id,))

        elif type_ == "closed_cases":
            cur.execute("SELECT caseid, casesubject, status FROM cases WHERE lawyerid=? AND status='CLOSED'", (user_id,))

        elif type_ == "upcoming_hearings":
            cur.execute("""
                SELECT ch.caseid, c.casesubject, ch.casedate as status
                FROM casehearing ch
                JOIN cases c ON c.caseid = ch.caseid
                WHERE c.lawyerid=? AND ch.casedate > ?
            """, (user_id, today))

        elif type_ == "today_hearings":
            cur.execute("""
                SELECT ch.caseid, c.casesubject, ch.casedate as status
                FROM casehearing ch
                JOIN cases c ON c.caseid = ch.caseid
                WHERE c.lawyerid=? AND ch.casedate = ?
            """, (user_id, today))

        elif type_ == "year_hearings":
            cur.execute("""
                SELECT ch.caseid, c.casesubject, ch.casedate as status
                FROM casehearing ch
                JOIN cases c ON c.caseid = ch.caseid
                WHERE c.lawyerid=? AND strftime('%Y', ch.casedate)=?
            """, (user_id, year))

        else:
            return jsonify([])

    else:
        return jsonify([])

    rows = cur.fetchall()
    conn.close()

    return jsonify([dict(r) for r in rows])
if __name__ == "__main__":
    app.run(debug=True)
