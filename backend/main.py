from flask import Flask, jsonify, render_template, request

app = Flask(__name__)

@app.route("/", methods= ["POST"])
def main():
    pass
    
    
    
    
            

   

app.run(debug=True)