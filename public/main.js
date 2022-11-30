const socket = io()
//-------------------------------------------------------------------------------------------------------//

socket.on('messages', data => {
    const html = data.map(msj => {
        return `<div>
        <strong style="color:blue;">${msj.author} :</strong>
        <span style="color:brown;">${msj.date}</span>   
        <em style="color:green;">${msj.text}</em>
        </div>`
    })
    .join(" ")

    document.getElementById("messages").innerHTML = html;
})

socket.on("products",data=>{
    const html = data.map(element =>{
        return `<tr>
        <td>${element.tittle}</td>
        <td>${element.price}</td>
        <td><img src="${element.thumbnail}" style="height: 40px;"/></td>    
      </tr>`
    })
    .join(" ")
    document.querySelector("#tablaProductos").innerHTML = html;
}) 
//-------------------------------------------------------------------------------------------------------//

function addMessage() {
    let fullDate = new Date();
    let date = (fullDate.getDate())+"/"+(fullDate.getMonth()+1)+"/"+(fullDate.getFullYear())+" "+(fullDate.getHours())+":"+(fullDate.getMinutes() >= 10 ? (fullDate.getMinutes()) :("0"+fullDate.getMinutes()) )
    const message = {
        author: document.getElementById("username").value,
        text: document.getElementById("text").value,
        date: date
    }
    if(message.author != "" && message.text != ""){
        socket.emit('new-message', message)
        return false
    }
    return false
}

function addProduct(){
    const producto = {
        tittle: document.querySelector("#tittleInput").value,
        price: document.querySelector("#priceInput").value,
        thumbnail: document.querySelector("#thumbnailInput").value
    }
    if(producto.tittle != "" && producto.price != "" && producto.thumbnail != ""){
        socket.emit("new-producto", producto)
        return false
    }
    if(producto.tittle === ""){
        alert("Falto ingresar el nombre del producto")
        return false
    }
    if(producto.price === ""){
        alert("Falto ingresar el precio del producto")
        return false
    }
    if(producto.thumbnail === ""){
        alert("Falto ingresar el url de la imagen del producto")
        return false
    }
    return false
    
}

//-------------------------------------------------------------------------------------------------------//
//-------------------------------------------------------------------------------------------------------//
