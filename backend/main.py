from flask import Flask, jsonify, render_template, request
from openai import OpenAI
import os
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(
    api_key=os.getenv("CHAVE_API"),
    base_url="https://api.groq.com/openai/v1",
)


app = Flask(__name__)

CORS(app)

@app.route("/chat", methods= ["POST"])
def main():

    if request.is_json:
        input_user = request.get_json(force=True)
        print(input_user)

        input_user_text = input_user.get("message")

        response = client.responses.create(
            input="isso é um formulario e voce esta recebendo uma observaçao sobre o metodo de ensino de uma ficha de pre conselho, resuma a resposta a seguir do aluno: " + input_user_text,
            model="openai/gpt-oss-20b",
            
        )
    
    
    return jsonify({"response": response.output_text})

   

app.run(port=5000)