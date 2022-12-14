const express = require("express");
const handlebars = require("express-handlebars");
const { Server: HttpServer } = require("http");
const { Server: IOServer } = require("socket.io");
//-------------------------------------------------------------------------------------------------------//
const { options, optionsSqlite } = require("./ecommerce/options/mysqlconn.js");
const { ClienteSQLproductos,ClienteSQLmensajes} = require("./ecommerce/client");
//-------------------------------------------------------------------------------------------------------//
const app = express();
const httpServer = HttpServer(app);
const io = new IOServer(httpServer);
app.use(express.static("./public"));
//-------------------------------------------------------------------------------------------------------//
app.engine("handlebars", handlebars.engine());
app.set("views", "./public/views");
app.set("view engine", "handlebars");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
//-------------------------------------------------------------------------------------------------------//
async function conectarProductos() {
  const con = new ClienteSQLproductos(options);
  return con;
}
async function conectarMensajes() {
  const con = new ClienteSQLmensajes(optionsSqlite);
  return con;
}
//-------------------------------------------------------------------------------------------------------//
// Usado para inicializar unos productos por defecto y para resetear los msjs.
//-------------------------------------------------------------------------------------------------------//
// const productos = [
//   {
//     tittle: "Microndas",
//     price: 5000,
//     thumbnail:
//       "https://cdn1.iconfinder.com/data/icons/home-tools-1/136/microwave-512.png",
//     id: 1,
//   },
//   {
//     tittle: "Horno",
//     price: 6500,
//     thumbnail:
//       "https://cdn1.iconfinder.com/data/icons/home-tools-1/136/stove-512.png",
//     id: 2,
//   },
//   {
//     tittle: "Aspiradora",
//     price: 3000,
//     thumbnail:"https://cdn0.iconfinder.com/data/icons/home-improvements-set-2-1/66/70-256.png",
//     id: 3,
//   },
//   {
//     tittle: "Licuadora",
//     price: 2000,
//     thumbnail:
//       "https://cdn1.iconfinder.com/data/icons/kitchen-and-food-2/44/blender-512.png",
//     id: 4,
//   }
// ];
// conectarProductos().then(res=>{
//   sql = res;
//   sql.crearTabla()
//     .then(() => {
//         console.log("Tabla productos creada")
//       return sql.insertarProductos(productos);
//     }).finally(() => {
//         sql.close();
//       });
// })

// conectarMensajes().then(res=>{
//   const sqlite = res;
//   sqlite.crearTabla().then(()=>{
//     console.log("tablaMensajesCreada")
//   }).finally(() => {
//     sqlite.close();
//   });
// })
//-------------------------------------------------------------------------------------------------------//

io.on("connection", (socket) => {
  console.log("un cliente se ha conectado");
  conectarMensajes().then((res) => {
    const sqlite = res;
    sqlite
      .listarMensaje()
      .then((msjs) => {
        socket.emit("messages", msjs);
      })
      .catch(() => {
        sqlite.crearTabla().then(() => {
          console.log("Tabla mensajes creada");
        });
      })
      .finally(() => {
        sqlite.close();
      });
  });

  conectarProductos().then((res) => {
    const sql = res;
    sql
      .listarProductos()
      .then((items) => {
        socket.emit("products", items);
      })
      .catch(() =>
        sql.crearTabla().then(() => {
          console.log("Tabla productos creada");
        })
      )
      .finally(() => {
        sql.close();
      });
  });

  socket.on("new-message", (data) => {
    conectarMensajes().then((res) => {
      const sqlite = res;
      sqlite
        .insertarMensaje(data)
        .then(() =>
          sqlite.listarMensaje().then((msjs) => {
            io.sockets.emit("messages", msjs);
          })
        )
        .finally(() => {
          sqlite.close();
        });
    });
  });
  socket.on("new-producto", (data) => {
    conectarProductos().then((res) => {
      const sql = res;
      sql
        .insertarProductos(data)
        .then(() =>
          sql.listarProductos().then((items) => {
            socket.emit("products", items);
          })
        )
        .finally(() => {
          sql.close();
        });
    });
  });
});

app.get("/", (req, res) => {
  res.render("datos");
});

//-------------------------------------------------------------------------------------------------------//

const PORT = 8080;

httpServer.listen(PORT, () => {
  console.log("servidor escuchando en el puerto " + PORT);
});
//-------------------------------------------------------------------------------------------------------//
