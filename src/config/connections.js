const mongoose = require('mongoose');

const mongoUrl = process.env.MONGO_URI;

const {
  UserSchema,
  BoardSchema,
  ColumnSchema,
  TaskSchema,
} = require('../schemas');

const conectionOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

// Creacion de conexion a la base de datos
mongoose.connect(
  mongoUrl.concat('/kanban?retryWrites=true&w=majority'),
  conectionOptions,
);

// Creacion de Colecciones
const User = mongoose.model('User', UserSchema);

const Board = mongoose.model('Board', BoardSchema);

const Column = mongoose.model('Column', ColumnSchema);

const Task = mongoose.model('Task', TaskSchema);

// Exportacion de Colecciones
module.exports = {
  User,
  Board,
  Column,
  Task,
};
