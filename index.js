// El documento dotenv funciona para obtener las variables
// de ambiente para el desarrollo del proyecto

require('dotenv').config();


// El framework Express funciona para crear un server en Node.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');


// Deconstruccion de elementos exportados del dotenv
const {
  serverPort,
  connections,
} = require('./src/config');

// Creacion de servidor de Node.js usando express
const app = express();

app.use(cors());
app.use(bodyParser.json());

// Inicializador de puerto de acceso al servidor
app.listen(parseInt(serverPort, 10), () => {
  console.log(`Server is running on Port: ${parseInt(serverPort, 10)}`);
});

/* eslint no-underscore-dangle: ["error", { "allow": ["_id"] }] */

// Metodos REST de Creacion de datos para la base de datos
app.post('/create/:type', async (req, res) => {
  // Evaluar el tipo de creacion a realizar
  if (req.params.type === 'user') {
    console.log(req.body);
    // Checar que no exista un usuario con este email
    const query = await connections.User.find(
      {
        mail: req.body.mail,
      },
    );
    if (query.length === 0) {
      // Crear un Documento de Mongo el cual tenga los datos almacenados
      const newUser = new connections.User(req.body);
      // Guardar Documento en la base de datos de MongoDB
      const savedData = await newUser.save();
      // Devolver el id del objeto para fines de UI
      res.status(200).send(savedData._id);
    } else {
      // Devolver error
      res.status(500).end();
    }
  } else if (req.params.type === 'board') {
    // Crear un Documento de Mongo para la coleccion de Board.
    const boardDocument = {
      name: req.body.name,
      sessions: [req.body.session],
    };
    const newBoard = new connections.Board(boardDocument);
    // Guardar Documento en la base de datos de MongoDB
    const savedData = await newBoard.save();
    // Devolver el id del objeto para fines de UI
    res.status(200).send(savedData._id);
  } else if (req.params.type === 'column') {
    // Crear un Documento de Mongo para la coleccion de Column.
    const columnDocument = {
      name: req.body.name,
      boardId: req.body.boardId,
      sessions: [req.body.session],
    };
    const newColumn = new connections.Column(columnDocument);
    // Guardar Documento en la base de datos de MongoDB
    const savedData = await newColumn.save();
    // Devolver el id del objeto para fines de UI
    res.status(200).send(savedData._id);
  } else if (req.params.type === 'task') {
    // Crear un Documento de Mongo para la coleccion de Column.
    const query = await connections.Column.findOne(
      {
        name: req.body.colName,
        sessions: [req.body.session],
        boardId: req.body.boardId,
      },
    );
    const taskDocument = {
      description: req.body.description,
      columnId: query._id,
      boardId: req.body.boardId,
    };
    const newTask = new connections.Task(taskDocument);
    // Guardar Documento en la base de datos de MongoDB
    const savedData = await newTask.save();
    // Devolver el id del objeto para fines de UI
    res.status(200).send(savedData._id);
  }
  // Terminar respuesta de metodo REST en caso de que no se
  // cumpla ninguno de los tipos de creacion
  res.end();
});

app.get('/:type', async (req, res) => {
  if (req.params.type === 'user') {
    // Obtener Usuario y verificar que los datos concuerden
    const query = await connections.User.findOne(
      {
        mail: req.body.mail,
      },
    );
    if (query
        && query.mail === req.body.mail
        && query.password === req.body.password
    ) {
      // Devolver el id del objeto para fines de UI
      res.status(200).send(query._id);
    } else {
      // Devolver error
      res.status(500).end();
    }
    res.end();
  } else if (req.params.type === 'board') {
    // Obtener Boards y verificar que correspondan a la sesion actual
    const query = await connections.Board.find(
      {
        sessions: [req.body.session],
      },
    );
    // Devolver el id del objeto para fines de UI
    res.status(200).send(query);
  } else if (req.params.type === 'column') {
    // Obtener Columns y verificar que correspondan a la sesion actual y al Board
    const query = await connections.Column.find(
      {
        sessions: [req.body.session],
        boardId: req.body.boardId,
      },
    );
    // Devolver el id del objeto para fines de UI
    res.status(200).send(query);
  } else if (req.params.type === 'task') {
    // Obtener Tasks y verificar que correspondan al Board y a la Columna
    const query = await connections.Task.find(
      {
        columnId: req.body.columnId,
        boardId: req.body.boardId,
      },
    );
    // Devolver el id del objeto para fines de UI
    res.status(200).send(query);
  }
  // Terminar respuesta de metodo REST en caso de que no se
  // cumpla ninguno de los tipos de creacion
  res.end();
});

app.post('/delete/:type', async (req, res) => {
  if (req.params.type === 'board') {
    // Borrar Tareas pertenecientes al Board
    connections.Task.deleteMany(
      {
        boardId: req.body.id,
      },
    ).then(() => {
      // Borrar Columnas pertenecientes al Board
      connections.Column.deleteMany(
        {
          boardId: req.body.id,
        },
      ).then(() => {
        // Borrar Board pertenecientes al Board
        connections.Board.deleteOne(
          {
            _id: req.body.id,
          },
        ).then(() => {
          // Terminar Metodo
          res.send('complete!');
        });
      });
    });
  } else if (req.params.type === 'column') {
    // Borrar Tareas pertenecientes a la Columna
    await connections.Task.deleteMany(
      {
        columnId: req.body.id,
      },
    );
    // Borrar Columna
    connections.Column.deleteOne(
      {
        _id: req.body.id,
      },
    ).then(async () => {
      // Obtener las Columnas existentes
      const query = await connections.Column.find(
        {
          sessions: [req.body.session],
          boardId: req.body.boardId,
        },
      );
      // Devolver las columnas existentes
      res.status(200).send(query);
    });
  } else if (req.params.type === 'task') {
    // Borrar Tarea
    connections.Task.deleteOne(
      {
        _id: req.body.id,
      },
    ).then(async () => {
      // Obtener Tareas existentes
      const query = await connections.Task.find(
        {
          columnId: req.body.columnId,
          boardId: req.body.boardId,
        },
      );
      // Devolver Tareas existentes
      res.status(200).send(query);
    });
  }
  // Terminar respuesta de metodo REST en caso de que no se
  // cumpla ninguno de los tipos de creacion
  res.end();
});

app.post('/updateTask/', async (req, res) => {
  // Obtener la Tarea que se debe de Modificar
  const currentTask = await connections.Task.findOne(
    {
      _id: req.body.id,
    },
  );
  currentTask.description = req.body.newDescription;
  currentTask.columnId = req.body.columnId;
  // Modificar el Documento
  const currentTaskDoc = connections.Task(currentTask);
  // Guardar cambios en el Documento
  currentTaskDoc.save().then((data) => {
    // Devolver el id del documento modificado para fines de la UI
    res.status(200).send(data._id);
  });
  // Terminar respuesta de metodo REST en caso de que no se
  // cumpla ninguno de los tipos de creacion
  res.end();
});
