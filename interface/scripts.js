
const text_area = window.document.getElementById("adc1")
const button1 = window.document.getElementById("b1")



button1.addEventListener("click",async function(){

try{
    const resposta = await fetch('http://127.0.0.1:5000/chat',{
        method: "POST",
        headers:{
            "Content-Type":"application/json",    
        },

        body: JSON.stringify({
            "message": text_area.value
                
            }),
            
        })
        

    const data = await resposta.json()
    console.log(data.response)
}

catch(error){

    console.log(`algo deu errado! error: ${error}`)
}

  
    
   

})


