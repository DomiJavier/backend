const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const connection = require('./db');
//const { subYears } = require('date-fns');
const app = express();

app.use(cors());
app.use(bodyParser.json());
const meses=[1,2,3,4,5,6,7,8,9,10,11,12];
const mes1=[12,1,2,3,4,5,6,7,8,9,10,11];
app.post('/login', (req, res) => {
  const { usuario, password } = req.body;
  const query = `SELECT * FROM usuarios WHERE usuario='${usuario}' AND pass='${password}'`;

  connection.query(query, (error, results) => {
    if (error) throw error;
    if (results.length > 0) {
      console.log(`Usuario = ${usuario} se ha logueado`);
      res.json({ success: true, message: 'Login exitoso' });
    } else {
      console.log(`Usuario = ${usuario} incorrecto`);
      res.json({ success: false, message: 'Credenciales incorrectas' });
    }
  });
});
app.get('/sintomas', (req,res) => {
  const query = `SELECT * FROM sintomas`;
  connection.query(query, (error, results) => {
    if (error) {
      console.error('Error al obtener datos de la base de datos:', err);
      res.status(500).send("Error");
    } else {
      res.json(results);
    }
  });
});
app.post('/crisis', (req, res) => {
  const { duracion, sintomas, usuario } = req.body;
  const fechaC = new Date();
  const horas = fechaC.getHours().toString().padStart(2, '0');

  //fechaC.setMonth(fechaC.getMonth()+1);
  const mes = fechaC.getMonth();
  const fecha = `${fechaC.getFullYear()}-${meses[mes]}-${fechaC.getUTCDate()}`;
  console.log(fecha)
  connection.beginTransaction((err) => {
    if (err) {
      console.error('Error al iniciar la transacción:', err);
      res.status(500).send('Error interno del servidor');
      return;
    }
    connection.query(`INSERT INTO crisis VALUES (0,'${fecha}','${usuario}','${duracion}','${horas}')`, (err1, results1) => {
      if(err1){
        console.error('Error al insertar en tabla1:', err1);
        // Revierte la transacción en caso de error
        connection.rollback(() => {
          res.status(500).send('Error interno del servidor');
        });
        return;
      }
      else{
        const idTabla = results1.insertId;
        for (let i=0; i< sintomas.length; i++){
          let posicion= sintomas[i];
          //console.log(posicion);
          //console.log(idTabla);
          connection.query(`INSERT INTO sintomatologia VALUES (0,'${posicion}','${idTabla}')`, (err2, results2) => {
            if (err2) {
              console.error(`Error al obtener datos de la base de datos: en el puesto:${i}`, err2);
              connection.rollback(() => {
                res.status(500).send('Error interno del servidor');
              });
              return;
            }
          });
        }
      }
      });
      connection.commit((commitErr) => {
        if (commitErr) {
          console.error('Error al confirmar la transacción:', commitErr);
          res.status(500).send('Error interno del servidor');
          return;
        }
      });
  });
});
app.post('/SintomasG', (req, res) => {
  const { usuario } = req.body;
  const fechaC1 = new Date();
  //fechaC1.setMonth(fechaC1.getMonth()+1);
  const mes = fechaC1.getMonth();
  const fecha1 = `${fechaC1.getFullYear()}-${meses[mes]}-${fechaC1.getUTCDate()}`;
  const fechaC2 = new Date();
  const fecha2 = `${fechaC2.getFullYear()}-${mes1[mes]}-${fechaC2.getUTCDate()}`;
  const query = `SELECT sintomas.sintoma, sintomas.color, count(sintomatologia.sintoma) AS contador FROM crisis INNER JOIN sintomatologia ON crisis.id=sintomatologia.crisis INNER JOIN sintomas ON sintomatologia.sintoma=sintomas.id WHERE crisis.usuario='${usuario}' AND crisis.fecha >= '${fecha2}' AND crisis.fecha <= '${fecha1}' GROUP BY sintomatologia.sintoma;`;
  console.log(query);
  connection.query(query, (error, results) => {
    if (error) throw error;
    if (results.length > 0) {
      //console.log(`Completo`);
      res.json(results);
    } else {
      //console.log(`Vacío`);
      data={'name': 'vacío', 'population': 1, 'color': black}
      res.json(data);
    }
  });
});
app.post('/Horario', (req, res) => {
  const { usuario } = req.body;
  const fechaC = new Date();
  //fechaC1.setMonth(fechaC1.getMonth()+1);
  const mes = fechaC.getMonth();
  const fecha1 = `${fechaC.getFullYear()}-${meses[mes]}-${fechaC.getUTCDate()}`;
  const fecha2 = `${fechaC.getFullYear()}-${mes1[mes]}-${fechaC.getUTCDate()}`;
  const query = `SELECT CONCAT(horario,':00') AS 'horario', count(horario) as cuenta FROM crisis WHERE usuario='${usuario}' AND fecha >= '${fecha2}' AND fecha <= '${fecha1}' GROUP BY horario;`;
  console.log(query);
  connection.query(query, (error, results) => {
    if (error) throw error;
    if (results.length > 0) {
      //console.log(`Completo`);
      res.json(results);
    } else {
      //console.log(`Vacío`);
      data={'name': 'vacío', 'population': 1, 'color': black}
      res.json(data);
    }
  });
});
app.post('/Mensual', (req, res) => {
  //console.log(`Mensual`);
  const { usuario } = req.body;
  const fechaC = new Date();
  const mes = fechaC.getMonth();
  const fecha1 = `${fechaC.getFullYear()}-${meses[mes]}-${fechaC.getUTCDate()}`;
  const fecha2 = `${fechaC.getFullYear()}-01-01`;
  const query = `SELECT MONTH(fecha) AS mes, count(id) AS id FROM crisis WHERE usuario=${usuario} AND fecha >= '${fecha2}' AND fecha <= '${fecha1}' GROUP BY MONTH(fecha) ORDER BY MONTH(fecha);`;
  console.log(query);
  connection.query(query, (error, results) => {
    if (error) throw error;
    if (results.length > 0) {
      //console.log(`Completo`);
      res.json(results);
    } else {
      //console.log(`Vacío`);
      data={'name': 'vacío', 'population': 1, 'color': black}
      res.json(data);
    }
  });
});
app.post('/Medicacion', (req, res) => {
  const { usuario } = req.body;
  const fechaC = new Date();
  const mes = fechaC.getMonth();
  const fecha = `${fechaC.getFullYear()}-${meses[mes]}-${fechaC.getUTCDate()}`;
  const query = `SELECT medicacion, CONCAT(hora,':00') AS 'hora', DATE_FORMAT(fecha, '%d-%m-%Y') as fecha FROM medicacion WHERE usuario='${usuario}' AND fecha >= '${fecha}'`;
  connection.query(query, (error, results) => {
    if (error) throw error;
    if (results.length > 0) {
      res.json(results);
    } else {
      data={'medicacion': 'vacío', 'hora': 0, 'fecha': ''}
      res.json(data);
    }
  });
});
app.post('/Notificaciones', (req, res) => {
  const { usuario } = req.body;
  const fechaC = new Date();
  const mes = fechaC.getMonth();
  const fecha1 = `${fechaC.getFullYear()}-${meses[mes]}-${fechaC.getUTCDate()}`;
  const query = `SELECT medicacion, hora, fecha FROM medicacion WHERE usuario='${usuario}' AND fecha >= '${fecha1}'`;
  console.log(query);
  connection.query(query, (error, results) => {
    if (error) throw error;
    if (results.length > 0) {
      //console.log(`Completo`);
      res.json(results);
    } else {
      data={'medicacion': 'vacío', 'hora': 0, 'fecha': ''}
      //console.log(data);
      res.json(data);
    }
  });
});
app.post('/NuevaMedicacion', (req, res) => {
  const { usuario, hora, medicacion, fecha } = req.body;
  console.log(fecha);
  const mes = fecha.getMonth();
  const fechaF = `${fecha.getFullYear()}-${meses[mes]}-${fecha.getUTCDate()}`;

  console.log(fechaF);
  const query = `INSERT INTO medicacion VALUES(0,'${medicacion}','${hora}','${usuario}','${fechaF}')`;
  console.log(query);
  connection.query(query, (error, results) => {
    if (error) throw error;
    if (results.length > 0) {
      res.json(results);
    } else {
      res.json(error);
    }
  });
});
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
