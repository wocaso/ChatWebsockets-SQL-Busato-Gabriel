const express = require("express");
const handlebars = require("express-handlebars");
const { Server: HttpServer } = require("http");
const {Server: IOServer} = require("socket.io");
const fs = require("fs");
//-------------------------------------------------------------------------------------------------------//


const app = express();
const httpServer = HttpServer(app);
const io = new IOServer(httpServer);

app.use(express.static("./public"))
//-------------------------------------------------------------------------------------------------------//

app.engine('handlebars', handlebars.engine())
app.set('views', './public/views')
app.set('view engine', 'handlebars')

app.use(express.urlencoded({extended: true}))
app.use(express.json())
//-------------------------------------------------------------------------------------------------------//

const productos = [
    {
      tittle: "Microndas",
      price: 5000,
      thumbnail:
        "https://cdn1.iconfinder.com/data/icons/home-tools-1/136/microwave-512.png",
      id: 1,
    },
    {
      tittle: "Horno",
      price: 6500,
      thumbnail:
        "https://cdn1.iconfinder.com/data/icons/home-tools-1/136/stove-512.png",
      id: 2,
    },
    {
      tittle: "Aspiradora",
      price: 3000,
      thumbnail:
        "https://cdn2.iconfinder.com/data/icons/appliance-electronic-vol-2/512/vacuum_cleaner_hoover_appliance-512.png",
      id: 3,
    },
    {
      tittle: "Licuadora",
      price: 2000,
      thumbnail:
        "https://cdn1.iconfinder.com/data/icons/kitchen-and-food-2/44/blender-512.png",
      id: 4,
    }
  ];



//-------------------------------------------------------------------------------------------------------//
function addWithNewId(data) {
    let i = 0;
    let lastId = 0;
    while (data[i] !== undefined) {
      lastId = data[i].id;
      i++;
    }
    return lastId + 1;
  }

  async function getAll(){
    try{
        const contenido = await fs.promises.readFile("./files/chat.txt", "utf-8")
        let data = JSON.parse(contenido);
        return data;
    }catch(err){

        console.log("Algo salio mal con el getAll", err)
        return [];
    }
        
    
}
async function saveObject(object){
  try{
    const contenido = await fs.promises.readFile("./files/chat.txt", "utf-8")
    let data = JSON.parse(contenido);
    data.push(object);
    fs.writeFile("./files/chat.txt",JSON.stringify(data, null, 2) , err=>{
      if(err){
          console.log("Algo salio mal leyendo el archivo en saveObject")
      }
  })
    return data;
}catch(err){

    console.log("Algo salio mal con el saveObject", err)
    return [];
}

}
//-------------------------------------------------------------------------------------------------------//


let mensajes = [];

//-------------------------------------------------------------------------------------------------------//

io.on("connection", socket=>{
    console.log("un cliente se ha conectado")
    getAll().then(data =>{
      mensajes = data;
      socket.emit("messages", mensajes)
    })
    socket.emit("products", productos)


    socket.on("new-message", data=>{
      saveObject(data).then(data =>{
          mensajes = data;
          io.sockets.emit("messages", mensajes)
        })
        
    })
    socket.on("new-producto", data=>{
        let newProducto = { ...data, id: addWithNewId(productos) }
        productos.push(newProducto);
        io.sockets.emit("products", productos)
    })
})


app.get("/", (req, res) => {
    res.render("datos");
  });

//-------------------------------------------------------------------------------------------------------//

const PORT = 8080;

httpServer.listen(PORT, ()=>{
    console.log("servidor escuchando en el puerto "+PORT);
})
//-------------------------------------------------------------------------------------------------------//
