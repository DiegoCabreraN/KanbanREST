const mongoose = require('mongoose');

const { Schema } = mongoose;

// Creacion de Esquema de Documentos
// Especificacion de Tipo de datos para cada campo
const UserSchema = new Schema({
  mail: String,
  password: String,
  fName: String,
  lName: String,
  birthday: String,
});

const BoardSchema = new Schema({
  name: String,
  sessions: Array,
});

const ColumnSchema = new Schema({
  name: String,
  boardId: String,
  sessions: Array,
});

const TaskSchema = new Schema({
  description: String,
  columnId: String,
  boardId: String,
});

// Exportacion de Esquemas
module.exports = {
  UserSchema,
  BoardSchema,
  ColumnSchema,
  TaskSchema,
};
