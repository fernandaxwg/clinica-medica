const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://doctorgomez:medico123@cluster0.u0vggxx.mongodb.net/clinica?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(MONGO_URI)
  .then(() => console.log('¡Conectado con éxito a MongoDB Atlas!'))
  .catch(err => console.error('Error al conectar a MongoDB:', err));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend conectado a la base de datos real' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en puerto ${PORT}`);
});